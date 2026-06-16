using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

internal static class SerialNovelControlLauncher
{
    private const int PreferredPort = 8787;
    private const int MaxPort = 8826;

    [STAThread]
    private static void Main()
    {
        Application.EnableVisualStyles();
        try
        {
            var pluginRoot = FindPluginRoot();
            KillOldServers();
            StartServer(pluginRoot);
            var url = WaitForServer();
            if (string.IsNullOrWhiteSpace(url))
            {
                throw new InvalidOperationException(
                    "网页服务没有在预期时间内启动。\n\n" +
                    "可以尝试：\n" +
                    "1. 重新双击本启动器。\n" +
                    "2. 确认 Python 3 已安装。\n" +
                    "3. 检查 8787 附近端口是否被安全软件拦截。"
                );
            }
            OpenUrl(url);
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                "启动小说控制台失败：\n\n" + ex.Message,
                "小说控制台启动器",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
    }

    private static string FindPluginRoot()
    {
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var localRoot = Path.GetFullPath(Path.Combine(baseDir, ".."));
        if (File.Exists(Path.Combine(localRoot, "scripts", "serve_web_control.py")))
        {
            return localRoot;
        }

        var home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        var installedRoot = Path.Combine(home, "plugins", "novel-writer");
        if (File.Exists(Path.Combine(installedRoot, "scripts", "serve_web_control.py")))
        {
            return installedRoot;
        }

        throw new FileNotFoundException(
            "没有找到小说控制台安装目录。请先运行一键安装包，或确认 C:\\Users\\Administrator\\plugins\\novel-writer 存在。"
        );
    }

    private static void KillOldServers()
    {
        var command =
            "Get-CimInstance Win32_Process | " +
            "Where-Object { ($_.Name -eq 'python.exe' -or $_.Name -eq 'pythonw.exe') -and $_.CommandLine -like '*novel-writer*serve_web_control.py*' } | " +
            "ForEach-Object { Stop-Process -Id $_.ProcessId -Force }";
        var startInfo = new ProcessStartInfo
        {
            FileName = "powershell.exe",
            Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"" + command + "\"",
            UseShellExecute = false,
            CreateNoWindow = true,
            WindowStyle = ProcessWindowStyle.Hidden
        };
        using (var process = Process.Start(startInfo))
        {
            if (process != null) process.WaitForExit(3500);
        }
        Thread.Sleep(300);
    }

    private static void StartServer(string pluginRoot)
    {
        var script = Path.Combine(pluginRoot, "scripts", "serve_web_control.py");
        if (!File.Exists(script))
        {
            throw new FileNotFoundException("没有找到网页端启动脚本。", script);
        }

        var python = FindPython();
        var fileName = Path.GetFileNameWithoutExtension(python);
        var isPyLauncher = fileName.Equals("py", StringComparison.OrdinalIgnoreCase)
            || fileName.Equals("pyw", StringComparison.OrdinalIgnoreCase);
        var arguments = isPyLauncher
            ? "-3 \"" + script + "\" --port " + PreferredPort
            : "\"" + script + "\" --port " + PreferredPort;

        var startInfo = new ProcessStartInfo
        {
            FileName = python,
            Arguments = arguments,
            WorkingDirectory = pluginRoot,
            UseShellExecute = false,
            CreateNoWindow = true,
            WindowStyle = ProcessWindowStyle.Hidden
        };
        Process.Start(startInfo);
    }

    private static string WaitForServer()
    {
        for (var i = 0; i < 80; i++)
        {
            for (var port = PreferredPort; port <= MaxPort; port++)
            {
                var url = "http://127.0.0.1:" + port + "/";
                if (IsServerReady(url)) return url;
            }
            Thread.Sleep(250);
        }
        return "";
    }

    private static bool IsServerReady(string url)
    {
        try
        {
            var request = (HttpWebRequest)WebRequest.Create(url + "api/app/status");
            request.Method = "GET";
            request.Timeout = 1000;
            using (var response = (HttpWebResponse)request.GetResponse())
            {
                return (int)response.StatusCode == 200;
            }
        }
        catch
        {
            return false;
        }
    }

    private static string FindPython()
    {
        var home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        var candidates = new[]
        {
            Path.Combine(home, "AppData", "Local", "Programs", "Python", "Python313", "pythonw.exe"),
            Path.Combine(home, "AppData", "Local", "Programs", "Python", "Python312", "pythonw.exe"),
            Path.Combine(home, "AppData", "Local", "Programs", "Python", "Python311", "pythonw.exe"),
            FindOnPath("pythonw.exe"),
            FindOnPath("pyw.exe"),
            FindOnPath("python.exe"),
            FindOnPath("py.exe")
        };
        foreach (var candidate in candidates)
        {
            if (!string.IsNullOrWhiteSpace(candidate) && File.Exists(candidate)) return candidate;
        }
        throw new FileNotFoundException("没有找到 Python。请先安装 Python 3。");
    }

    private static string FindOnPath(string fileName)
    {
        var pathValue = Environment.GetEnvironmentVariable("PATH") ?? "";
        foreach (var part in pathValue.Split(Path.PathSeparator))
        {
            try
            {
                var fullPath = Path.Combine(part.Trim(), fileName);
                if (File.Exists(fullPath)) return fullPath;
            }
            catch
            {
                // Ignore invalid PATH entries.
            }
        }
        return "";
    }

    private static void OpenUrl(string url)
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = url,
            UseShellExecute = true
        });
    }
}
