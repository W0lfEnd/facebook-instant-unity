using System.IO;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEngine;

namespace FBInstant
{
    public class FBInstantBuildPostprocessor
    {
        [PostProcessBuild(100)]
        public static void OnPostprocessBuild(BuildTarget target, string pathToBuiltProject) 
        {
            if (target == BuildTarget.WebGL)
            {
                var buildPath = Path.Combine(pathToBuiltProject, "Build");
                var files = Directory.GetFiles(buildPath, "*.framework.js");

                if (files.Length != 1)
                {
                    Debug.LogError($"One '*.framework.js' file expected. {files.Length} files found.");
                    return;
                }

                var frameworkFile = files[0];
                string text = File.ReadAllText(frameworkFile);

                string baseCodeText = "function _emscripten_sample_gamepad_data(){return";
                string fixedCodeText = "function _emscripten_sample_gamepad_data(){return -1;";
                if (!text.Contains(baseCodeText))
                {
                    Debug.LogError("Can not find text for fixing.");
                    return;
                }

                text = text.Replace(baseCodeText, fixedCodeText);
                File.WriteAllText(frameworkFile, text);
            }
        }
    }
}