use std::fs;
use std::path::Path;

/// Copy a dropped image into an `assets/` folder next to the markdown file
/// and return the relative path (e.g. `assets/pic.png`) to embed.
#[tauri::command]
pub fn import_image(src: String, md_path: String) -> Result<String, String> {
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
pub fn save_image_bytes(
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

    let ext = if ext.is_empty() {
        "png".to_string()
    } else {
        ext
    };
    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let name = format!("pasted-{ts}.{ext}");
    let dest = assets.join(&name);
    fs::write(&dest, &data).map_err(|e| format!("保存图片失败: {e}"))?;
    Ok(format!("assets/{name}"))
}
