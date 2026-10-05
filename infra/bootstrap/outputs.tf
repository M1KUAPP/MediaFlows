output "state_bucket_name" {
  description = "S3 bucket name holding the parent infra/ stack's Terraform state"
  value       = aws_s3_bucket.tfstate.bucket
}

output "state_bucket_region" {
  description = "Region of the state bucket"
  value       = var.aws_region
}

output "github_actions_role_arn" {
  description = "ARN of the IAM role GitHub Actions can assume via OIDC (no workflow in this repository uses it)"
  value       = aws_iam_role.github_actions.arn
}

output "oidc_provider_arn" {
  description = "GitHub OIDC provider ARN"
  value       = aws_iam_openid_connect_provider.github.arn
}

output "ssm_parameter_paths" {
  description = "SSM SecureString paths that hold operator-seeded secrets"
  value = {
    db_password     = aws_ssm_parameter.db_password.name
    nextauth_secret = aws_ssm_parameter.nextauth_secret.name
    github_pat      = aws_ssm_parameter.github_pat.name
  }
}

# Backend config for the parent infra/ stack (kept local; gitignored).
# Operators run: terraform -chdir=infra init -backend-config=bootstrap/backend.hcl
output "backend_hcl" {
  description = "Write this to infra/bootstrap/backend.hcl (gitignored — do not commit)"
  value       = <<-EOT
    bucket       = "${aws_s3_bucket.tfstate.bucket}"
    key          = "environments/${var.environment}/terraform.tfstate"
    region       = "${var.aws_region}"
    encrypt      = true
    use_lockfile = true
  EOT
}
