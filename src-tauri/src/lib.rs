use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::Emitter;

/// A node in the markdown file tree shown in the sidebar.
#[derive(Serialize)]
struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
    children: Vec<FileNode>,
}

/// Read the textual content of a file (used for markdown files).
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("无法读取文件 {path}: {e}"))
}

/// Write textual content to a file (used to save markdown edits).
#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("无法保存文件 {path}: {e}"))
}

/// Copy a dropped image into an `assets/` folder next to the markdown file
/// and return the relative path (e.g. `assets/pic.png`) to embed.
#[tauri::command]
fn import_image(src: String, md_path: String) -> Result<String, String> {
    let src_path = Path::new(&src);
    if !src_path.is_file() {
        return Err(format!("源文件不存在: {src}"));
    }

    let md = Path::new(&md_path);
    let base_dir = md
        .parent()
        .ok_or_else(|| "请先保存文档后再插入图片".to_string())?;

    let assets = base_dir.join("assets");
    fs::create_dir_all(&assets).map_err(|e| format!("无法创建 assets 目录: {e}"))?;

    let file_name = src_path
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| "无效的文件名".to_string())?;

    // Resolve a non-conflicting destination name.
    let mut dest = assets.join(file_name);
    if dest.exists() {
        let stem = src_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("image");
        let ext = src_path
            .extension()
            .and_then(|s| s.to_str())
            .map(|e| format!(".{e}"))
            .unwrap_or_default();
        let mut i = 1;
        loop {
            let candidate = assets.join(format!("{stem}-{i}{ext}"));
            if !candidate.exists() {
                dest = candidate;
                break;
            }
            i += 1;
        }
    }

    fs::copy(src_path, &dest).map_err(|e| format!("复制图片失败: {e}"))?;

    let final_name = dest
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| "无法解析目标文件名".to_string())?;
    Ok(format!("assets/{final_name}"))
}

/// Save raw image bytes (e.g. from clipboard paste) into the `assets/`
/// folder next to the markdown file. Returns the relative path to embed.
#[tauri::command]
fn save_image_bytes(
    data: Vec<u8>,
    ext: String,
    md_path: String,
) -> Result<String, String> {
    if data.is_empty() {
        return Err("剪贴板没有图片数据".to_string());
    }
    let md = Path::new(&md_path);
    let base_dir = md
        .parent()
        .ok_or_else(|| "请先保存文档后再粘贴图片".to_string())?;
    let assets = base_dir.join("assets");
    fs::create_dir_all(&assets).map_err(|e| format!("无法创建 assets 目录: {e}"))?;

    let ext = if ext.is_empty() { "png".to_string() } else { ext };
    // Use a timestamp-based unique name.
    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let name = format!("pasted-{ts}.{ext}");
    let dest = assets.join(&name);
    fs::write(&dest, &data).map_err(|e| format!("保存图片失败: {e}"))?;
    Ok(format!("assets/{name}"))
}

/// Create a new empty markdown file inside `dir`. Returns the new path.
#[tauri::command]
fn create_markdown(dir: String, name: String) -> Result<String, String> {
    let name = name.trim();
    if name.is_empty() {
        return Err("文件名不能为空".to_string());
    }
    // Reject path separators to prevent traversal.
    if name.contains('/') || name.contains('\\') || name.contains("..") {
        return Err("文件名不合法".to_string());
    }
    let file_name = if is_markdown(Path::new(name)) {
        name.to_string()
    } else {
        format!("{name}.md")
    };
    let dir_path = PathBuf::from(&dir);
    if !dir_path.is_dir() {
        return Err(format!("{dir} 不是有效的文件夹"));
    }
    let dest = dir_path.join(&file_name);
    if dest.exists() {
        return Err(format!("{file_name} 已存在"));
    }
    fs::write(&dest, "").map_err(|e| format!("创建文件失败: {e}"))?;
    Ok(dest.to_string_lossy().to_string())
}

/// Rename a file to `new_name` (within the same directory). Returns new path.
#[tauri::command]
fn rename_path(path: String, new_name: String) -> Result<String, String> {
    let new_name = new_name.trim();
    if new_name.is_empty() {
        return Err("名称不能为空".to_string());
    }
    if new_name.contains('/') || new_name.contains('\\') || new_name.contains("..") {
        return Err("名称不合法".to_string());
    }
    let src = PathBuf::from(&path);
    let parent = src
        .parent()
        .ok_or_else(|| "无法解析父目录".to_string())?;
    let final_name = if src.is_file() && !is_markdown(Path::new(new_name)) {
        format!("{new_name}.md")
    } else {
        new_name.to_string()
    };
    let dest = parent.join(&final_name);
    if dest.exists() {
        return Err(format!("{final_name} 已存在"));
    }
    fs::rename(&src, &dest).map_err(|e| format!("重命名失败: {e}"))?;
    Ok(dest.to_string_lossy().to_string())
}

/// Delete a file or (empty/non-empty) directory.
#[tauri::command]
fn delete_path(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if p.is_dir() {
        fs::remove_dir_all(&p).map_err(|e| format!("删除文件夹失败: {e}"))
    } else {
        fs::remove_file(&p).map_err(|e| format!("删除文件失败: {e}"))
    }
}

/// Return the file name (with extension) of a given path.
#[tauri::command]
fn file_name(path: String) -> String {
    Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string()
}

/// Recursively scan a directory and build a tree containing only
/// markdown files and the folders that lead to them.
#[tauri::command]
fn scan_dir(path: String) -> Result<FileNode, String> {
    let root = PathBuf::from(&path);
    if !root.is_dir() {
        return Err(format!("{path} 不是有效的文件夹"));
    }
    build_node(&root).ok_or_else(|| "该文件夹下没有 Markdown 文件".to_string())
}

/// Build a tree node for `dir`, keeping only markdown files and
/// directories that ultimately contain at least one markdown file.
fn build_node(dir: &Path) -> Option<FileNode> {
    let mut children: Vec<FileNode> = Vec::new();

    let entries = fs::read_dir(dir).ok()?;
    let mut entries: Vec<_> = entries.filter_map(|e| e.ok()).collect();
    entries.sort_by_key(|e| e.file_name());

    for entry in entries {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files/folders and common heavy directories.
        if name.starts_with('.')
            || name == "node_modules"
            || name == "target"
            || name == "dist"
        {
            continue;
        }

        if entry_path.is_dir() {
            if let Some(node) = build_node(&entry_path) {
                children.push(node);
            }
        } else if is_markdown(&entry_path) {
            children.push(FileNode {
                name,
                path: entry_path.to_string_lossy().to_string(),
                is_dir: false,
                children: Vec::new(),
            });
        }
    }

    // Drop directories that contain no markdown files.
    if children.is_empty() {
        return None;
    }

    Some(FileNode {
        name: dir
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| dir.to_string_lossy().to_string()),
        path: dir.to_string_lossy().to_string(),
        is_dir: true,
        children,
    })
}

/// A single matched line within a file.
#[derive(Serialize)]
struct SearchMatch {
    line: usize,
    text: String,
}

/// Search results grouped per file.
#[derive(Serialize)]
struct SearchResult {
    name: String,
    path: String,
    matches: Vec<SearchMatch>,
}

/// Search all markdown files under `root` for `query` and return matching
/// lines grouped by file. Case-insensitive. Bounded to keep the UI snappy.
#[tauri::command]
fn search_dir(root: String, query: String) -> Result<Vec<SearchResult>, String> {
    let query = query.trim();
    if query.is_empty() {
        return Ok(Vec::new());
    }
    let root_path = PathBuf::from(&root);
    if !root_path.is_dir() {
        return Err(format!("{root} 不是有效的文件夹"));
    }

    let needle = query.to_lowercase();
    let mut files: Vec<PathBuf> = Vec::new();
    collect_markdown(&root_path, &mut files);

    const MAX_FILES: usize = 500;
    const MAX_MATCHES_PER_FILE: usize = 50;
    const MAX_LINE_LEN: usize = 240;

    let mut results: Vec<SearchResult> = Vec::new();
    for file in files.iter().take(MAX_FILES) {
        let content = match fs::read_to_string(file) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let mut matches: Vec<SearchMatch> = Vec::new();
        for (i, line) in content.lines().enumerate() {
            if line.to_lowercase().contains(&needle) {
                let mut text = line.trim().to_string();
                if text.len() > MAX_LINE_LEN {
                    text.truncate(MAX_LINE_LEN);
                    text.push('…');
                }
                matches.push(SearchMatch { line: i + 1, text });
                if matches.len() >= MAX_MATCHES_PER_FILE {
                    break;
                }
            }
        }
        if !matches.is_empty() {
            results.push(SearchResult {
                name: file
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default(),
                path: file.to_string_lossy().to_string(),
                matches,
            });
        }
    }

    Ok(results)
}

/// Recursively collect markdown file paths, skipping hidden/heavy dirs.
fn collect_markdown(dir: &Path, out: &mut Vec<PathBuf>) {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    let mut entries: Vec<_> = entries.filter_map(|e| e.ok()).collect();
    entries.sort_by_key(|e| e.file_name());

    for entry in entries {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.')
            || name == "node_modules"
            || name == "target"
            || name == "dist"
        {
            continue;
        }
        if path.is_dir() {
            collect_markdown(&path, out);
        } else if is_markdown(&path) {
            out.push(path);
        }
    }
}

/// Whether a path points to a markdown file by extension.
fn is_markdown(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|e| e.to_str()).map(|e| e.to_lowercase()),
        Some(ref e) if e == "md" || e == "markdown" || e == "mdx"
    )
}

/// Localized labels for the native menu, keyed by a two-letter language code.
struct MenuLabels {
    file: &'static str,
    new_file: &'static str,
    open_file: &'static str,
    open_folder: &'static str,
    save: &'static str,
    save_as: &'static str,
    reveal: &'static str,
    edit: &'static str,
    find: &'static str,
    global_search: &'static str,
    view: &'static str,
    view_preview: &'static str,
    view_split: &'static str,
    view_source: &'static str,
    toggle_sidebar: &'static str,
    toggle_outline: &'static str,
    toggle_theme: &'static str,
}

fn menu_labels(lang: &str) -> MenuLabels {
    if lang == "en" {
        MenuLabels {
            file: "File",
            new_file: "New File",
            open_file: "Open File…",
            open_folder: "Open Folder…",
            save: "Save",
            save_as: "Save As…",
            reveal: "Reveal in Finder",
            edit: "Edit",
            find: "Find",
            global_search: "Global Search",
            view: "View",
            view_preview: "Preview",
            view_split: "Split",
            view_source: "Source",
            toggle_sidebar: "Toggle Sidebar",
            toggle_outline: "Toggle Outline",
            toggle_theme: "Toggle Theme",
        }
    } else {
        MenuLabels {
            file: "文件",
            new_file: "新建文件",
            open_file: "打开文件…",
            open_folder: "打开文件夹…",
            save: "保存",
            save_as: "另存为…",
            reveal: "在 Finder 中显示",
            edit: "编辑",
            find: "查找",
            global_search: "全局搜索",
            view: "视图",
            view_preview: "预览模式",
            view_split: "分屏模式",
            view_source: "源码模式",
            toggle_sidebar: "切换侧边栏",
            toggle_outline: "切换大纲",
            toggle_theme: "切换主题",
        }
    }
}

/// Build the native application menu (App / File / Edit / View) in the given
/// language. Custom items carry an id that is forwarded to the frontend via a
/// "menu" event; predefined items (undo/copy/paste…) are handled natively.
fn build_app_menu(
    handle: &tauri::AppHandle,
    lang: &str,
) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let t = menu_labels(lang);

    // macOS application menu (about / hide / quit).
    let app_menu = SubmenuBuilder::new(handle, "MarkView")
        .about(None)
        .separator()
        .services()
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .build()?;

    let new_file = MenuItemBuilder::with_id("new_file", t.new_file)
        .accelerator("CmdOrCtrl+N")
        .build(handle)?;
    let open_file = MenuItemBuilder::with_id("open_file", t.open_file)
        .accelerator("CmdOrCtrl+O")
        .build(handle)?;
    let open_folder = MenuItemBuilder::with_id("open_folder", t.open_folder)
        .accelerator("CmdOrCtrl+Shift+O")
        .build(handle)?;
    let save = MenuItemBuilder::with_id("save", t.save)
        .accelerator("CmdOrCtrl+S")
        .build(handle)?;
    let save_as = MenuItemBuilder::with_id("save_as", t.save_as)
        .accelerator("CmdOrCtrl+Shift+S")
        .build(handle)?;
    let reveal = MenuItemBuilder::with_id("reveal", t.reveal)
        .build(handle)?;
    let file_menu = SubmenuBuilder::new(handle, t.file)
        .item(&new_file)
        .separator()
        .item(&open_file)
        .item(&open_folder)
        .separator()
        .item(&save)
        .item(&save_as)
        .separator()
        .item(&reveal)
        .separator()
        .close_window()
        .build()?;

    let find = MenuItemBuilder::with_id("find", t.find)
        .accelerator("CmdOrCtrl+F")
        .build(handle)?;
    let global_search = MenuItemBuilder::with_id("global_search", t.global_search)
        .accelerator("CmdOrCtrl+Shift+F")
        .build(handle)?;
    let edit_menu = SubmenuBuilder::new(handle, t.edit)
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .separator()
        .item(&find)
        .item(&global_search)
        .build()?;

    let view_preview = MenuItemBuilder::with_id("view_preview", t.view_preview)
        .accelerator("CmdOrCtrl+1")
        .build(handle)?;
    let view_split = MenuItemBuilder::with_id("view_split", t.view_split)
        .accelerator("CmdOrCtrl+2")
        .build(handle)?;
    let view_source = MenuItemBuilder::with_id("view_source", t.view_source)
        .accelerator("CmdOrCtrl+3")
        .build(handle)?;
    let toggle_sidebar = MenuItemBuilder::with_id("toggle_sidebar", t.toggle_sidebar)
        .accelerator("CmdOrCtrl+\\")
        .build(handle)?;
    let toggle_outline = MenuItemBuilder::with_id("toggle_outline", t.toggle_outline)
        .build(handle)?;
    let toggle_theme = MenuItemBuilder::with_id("toggle_theme", t.toggle_theme)
        .accelerator("CmdOrCtrl+Shift+L")
        .build(handle)?;
    let view_menu = SubmenuBuilder::new(handle, t.view)
        .item(&view_preview)
        .item(&view_split)
        .item(&view_source)
        .separator()
        .item(&toggle_sidebar)
        .item(&toggle_outline)
        .item(&toggle_theme)
        .build()?;

    MenuBuilder::new(handle)
        .item(&app_menu)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .build()
}

/// Rebuild and apply the native menu in the requested language.
#[tauri::command]
fn rebuild_menu(app: tauri::AppHandle, lang: String) -> Result<(), String> {
    let menu = build_app_menu(&app, &lang).map_err(|e| e.to_string())?;
    app.set_menu(menu).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Default to Chinese; the frontend rebuilds the menu in the user's
            // saved language right after it mounts.
            let menu = build_app_menu(app.handle(), "zh")?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            // Forward custom menu ids to the frontend.
            let _ = app.emit("menu", event.id().0.clone());
        })
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            import_image,
            save_image_bytes,
            create_markdown,
            rename_path,
            delete_path,
            file_name,
            scan_dir,
            search_dir,
            rebuild_menu
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
