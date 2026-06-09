use std::fs;
use std::path::{Path, PathBuf};

use crate::fs_util::{is_markdown, should_skip_dir_name};
use crate::models::FileNode;

/// Read the textual content of a file (used for markdown files).
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("无法读取文件 {path}: {e}"))
}

/// Write textual content to a file (used to save markdown edits).
#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("无法保存文件 {path}: {e}"))
}

/// Return the file name (with extension) of a given path.
#[tauri::command]
pub fn file_name(path: String) -> String {
    Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string()
}

/// Create a new empty markdown file inside `dir`. Returns the new path.
#[tauri::command]
pub fn create_markdown(dir: String, name: String) -> Result<String, String> {
    let name = name.trim();
    if name.is_empty() {
        return Err("文件名不能为空".to_string());
    }
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
pub fn rename_path(path: String, new_name: String) -> Result<String, String> {
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
pub fn delete_path(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if p.is_dir() {
        fs::remove_dir_all(&p).map_err(|e| format!("删除文件夹失败: {e}"))
    } else {
        fs::remove_file(&p).map_err(|e| format!("删除文件失败: {e}"))
    }
}

/// Recursively scan a directory and build a tree containing only
/// markdown files and the folders that lead to them.
#[tauri::command]
pub fn scan_dir(path: String) -> Result<FileNode, String> {
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

        if should_skip_dir_name(&name) {
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
