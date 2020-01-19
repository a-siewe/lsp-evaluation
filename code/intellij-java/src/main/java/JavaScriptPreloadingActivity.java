import com.intellij.openapi.application.PreloadingActivity;
import com.intellij.openapi.progress.ProgressIndicator;
import org.jetbrains.annotations.NotNull;
import org.wso2.lsp4intellij.IntellijLanguageClient;
import org.wso2.lsp4intellij.client.languageserver.serverdefinition.RawCommandServerDefinition;

public class JavaScriptPreloadingActivity extends PreloadingActivity {
    @Override
    public void preload(@NotNull ProgressIndicator indicator) {
        // Register Java Language Server
       String[] command = new String[]{
             "java",
             "-Declipse.application=org.eclipse.jdt.ls.core.id1",
             "-Dosgi.bundles.defaultStartLevel=4",
             "-Declipse.product=org.eclipse.jdt.ls.core.product",
             "-Dlog.level=ALL",
             "-noverify",
             "-Dfile.encoding=UTF-8",
             "-Xmx1G",
             "-jar",
             "/home/asiewe/MEGA/HDA/SS19/Abschluss/Workspace/iviews/servers/jdt-language-server/plugins/org.eclipse.equinox.launcher_1.5.600.v20191014-2022.jar",
             "-configuration",
             "/home/asiewe/MEGA/HDA/SS19/Abschluss/Workspace/iviews/servers/jdt-language-server/config_linux",
             "-data",
             "/home/asiewe/MEGA/HDA/SS19/Abschluss/Workspace/fixtures/java-project/"};
        IntellijLanguageClient.addServerDefinition(new RawCommandServerDefinition("java ", command ));*/
    }
}
