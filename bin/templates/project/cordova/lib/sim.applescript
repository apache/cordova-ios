tell application "System Events"
	set UI elements enabled to true
end tell

tell application "iPhone Simulator"
    activate
end tell

tell application "System Events"
    tell process "iPhone Simulator"
    click menu item "$DEVICE_NAME" of menu 1 of menu item "Device" of menu 1 of menu bar item "Hardware" of menu bar 1
    click menu item "Home" of menu 1 of menu bar item "Hardware" of menu bar 1
    end tell
end tell
