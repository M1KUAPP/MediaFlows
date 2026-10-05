using FluentAssertions;

namespace MediaFlows.Web.Tests.Infrastructure;

public class StorageCorsContractTests
{
    private static readonly string RepoRoot = FindRepoRoot();

    // Walk up from the test output folder to the one holding the solution
    // file, so the lookup doesn't depend on how deep this project sits.
    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "MediaFlows.slnx")))
            dir = dir.Parent;
        return dir?.FullName
            ?? throw new InvalidOperationException(
                $"MediaFlows.slnx not found above {AppContext.BaseDirectory}");
    }

    private static string ReadRepoFile(string relativePath) =>
        File.ReadAllText(Path.Combine(RepoRoot, relativePath));

    [Fact]
    public void RootTerraform_ShouldPassCorsAllowedOrigins_IntoStorageModule()
    {
        var variables = ReadRepoFile("infra/variables.tf");
        var rootMain = ReadRepoFile("infra/main.tf");

        variables.Should().Contain("variable \"cors_allowed_origins\"");
        rootMain.Should().Contain("cors_allowed_origins = var.cors_allowed_origins");
    }

    [Fact]
    public void ProductionTfvars_ShouldAllowTheProductionOrigin()
    {
        // Real prod.tfvars is gitignored; the committed .example file
        // documents the contract and is what CI inspects.
        var prodTfvars = ReadRepoFile("infra/environments/prod.tfvars.example");

        prodTfvars.Should().Contain("cors_allowed_origins");
        // The frontend now serves at app.${domain} because the dead account
        // still globally claims the apex Amplify domain. Either host is
        // acceptable here — the apex or the app subdomain.
        prodTfvars.Should().MatchRegex("https://(app\\.)?mediaflows\\.tech");
    }
}
