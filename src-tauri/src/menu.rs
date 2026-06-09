use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};

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
/// language. Custom items carry an id forwarded to the frontend via a
/// "menu" event; predefined items (undo/copy/paste…) are handled natively.
pub fn build_app_menu(
    handle: &tauri::AppHandle,
    lang: &str,
) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let t = menu_labels(lang);

    let app_menu = SubmenuBuilder::new(handle, "Padora")
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
    let reveal = MenuItemBuilder::with_id("reveal", t.reveal).build(handle)?;
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
pub fn rebuild_menu(app: tauri::AppHandle, lang: String) -> Result<(), String> {
    let menu = build_app_menu(&app, &lang).map_err(|e| e.to_string())?;
    app.set_menu(menu).map_err(|e| e.to_string())?;
    Ok(())
}
