use tauri::{LogicalSize, Manager, WindowEvent};

/// Mini-mode: a compact, always-on-top window (desktop only). The frontend
/// tracks the boolean and calls this to toggle; other platforms never invoke it.
#[tauri::command]
fn set_mini(window: tauri::WebviewWindow, mini: bool) -> tauri::Result<()> {
    if mini {
        window.set_always_on_top(true)?;
        let _ = window.set_decorations(false);
        window.set_size(LogicalSize::new(300.0, 360.0))?;
    } else {
        window.set_always_on_top(false)?;
        let _ = window.set_decorations(true);
        window.set_size(LogicalSize::new(420.0, 620.0))?;
    }
    Ok(())
}

/// Show the window if hidden, hide it if visible (tray click / menu).
#[cfg(desktop)]
fn toggle_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

/// System tray with a Show/Hide + Quit menu (desktop only).
#[cfg(desktop)]
fn setup_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    use tauri::menu::{MenuBuilder, MenuItemBuilder};
    use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

    let show = MenuItemBuilder::with_id("show", "Show / Hide").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
    let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;

    TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Pomodoro")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => toggle_window(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_window(tray.app_handle());
            }
        })
        .build(app)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    // Single instance: focus the running window instead of launching a second one.
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }));
    }

    builder
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            #[cfg(desktop)]
            setup_tray(app.handle())?;
            Ok(())
        })
        // Close to tray: keep the timer running in the background.
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![set_mini])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
