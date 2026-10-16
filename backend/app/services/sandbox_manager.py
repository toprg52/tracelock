import subprocess
import shutil
import time

class SandboxManager:
    def __init__(self, avd_name: str = "TracelockEmulator"):
        self.avd_name = avd_name

    def check_dependencies(self) -> bool:
        return shutil.which("adb") is not None and shutil.which("emulator") is not None

    def start_emulator(self) -> bool:
        if not self.check_dependencies():
            print("[!] ADB or Emulator utilities not found. Skipping hypervisor spawn.")
            return False
        try:
            cmd = ["emulator", "-avd", self.avd_name, "-writable-system", "-no-snapshot"]
            subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            # Wait for boot completion loop
            for _ in range(30):
                boot_res = subprocess.run(["adb", "shell", "getprop", "sys.boot_completed"], capture_output=True, text=True)
                if "1" in boot_res.stdout:
                    return True
                time.sleep(2)
            return False
        except Exception:
            return False

    def install_apk(self, apk_path: str) -> bool:
        try:
            res = subprocess.run(["adb", "install", "-r", apk_path], capture_output=True, text=True)
            return res.returncode == 0
        except Exception:
            return False

    def destroy_sandbox(self):
        try:
            subprocess.run(["adb", "emu", "kill"], capture_output=True)
        except Exception:
            pass
