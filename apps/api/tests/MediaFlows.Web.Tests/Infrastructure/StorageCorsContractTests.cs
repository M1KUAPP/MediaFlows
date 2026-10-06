using System.Text.RegularExpressions;
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
    public void ProductionTfvars_ShouldAllowTheWebOrigin()
    {
        // prod.tfvars' domain is a placeholder, so the expected origin is built
        // from its domain_name. Amplify serves the web app at web.<domain>.
        var prodTfvars = ReadRepoFile("infra/environments/prod.tfvars");
        var rootMain = ReadRepoFile("infra/main.tf");

        var domain = Regex.Match(prodTfvars, "^domain_name\\s*=\\s*\"([^\"]+)\"", RegexOptions.Multiline);
        domain.Success.Should().BeTrue("prod.tfvars sets domain_name");

        var origins = Regex.Match(prodTfvars, "cors_allowed_origins\\s*=\\s*\\[([^\\]]*)\\]");
        origins.Success.Should().BeTrue("prod.tfvars sets cors_allowed_origins");

        rootMain.Should().Contain("custom_domain = var.domain_name != \"\" ? \"web.${var.domain_name}\"");
        origins.Groups[1].Value.Should().Contain($"\"https://web.{domain.Groups[1].Value}\"");
    }
}
