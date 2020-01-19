import com.intellij.openapi.application.PreloadingActivity;
import com.intellij.openapi.progress.ProgressIndicator;
import org.jetbrains.annotations.NotNull;
import org.wso2.lsp4intellij.IntellijLanguageClient;
import org.wso2.lsp4intellij.client.languageserver.serverdefinition.RawCommandServerDefinition;

public class JavaScriptPreloadingActivity extends PreloadingActivity {
    @Override
    public void preload(@NotNull ProgressIndicator indicator) {
        // Register JavaScript Language Server
     IntellijLanguageClient.addServerDefinition(new RawCommandServerDefinition("js,ts ", new String[]{"javascript-typescript-stdio", "-l", " logFile.log"} ));
    }
}
