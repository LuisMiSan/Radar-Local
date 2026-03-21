Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut(WshShell.SpecialFolders("Desktop") & "\Radar Local.lnk")
shortcut.TargetPath = "C:\Users\USER\radar-local\start-radar.bat"
shortcut.WorkingDirectory = "C:\Users\USER\radar-local"
shortcut.IconLocation = "C:\Windows\System32\shell32.dll,14"
shortcut.Description = "Radar Local - SEO Dashboard"
shortcut.WindowStyle = 7
shortcut.Save
WScript.Echo "Acceso directo creado en el escritorio!"
