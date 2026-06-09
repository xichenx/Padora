mod commands;
mod fs_util;
mod menu;
mod models;

use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let menu = menu::build_app_menu(app.handle(), "zh")?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            let _ = app.emit("menu", event.id().0.clone());
        })
        .invoke_handler(tauri::generate_handler![
            commands::file::read_file,
            commands::file::write_file,
            commands::image::import_image,
            commands::image::save_image_bytes,
            commands::file::create_markdown,
            commands::file::rename_path,
            commands::file::delete_path,
            commands::file::file_name,
            commands::file::scan_dir,
            commands::search::search_dir,
            menu::rebuild_menu,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
