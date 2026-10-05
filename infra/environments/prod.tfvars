environment = "prod"

github_owner = "M1KUAPP"
github_repo  = "MediaFlows"

db_instance_class    = "db.t3.micro"
db_allocated_storage = 20
eb_instance_type     = "t3.micro"
eb_min_instances     = 1
eb_max_instances     = 4
lambda_memory_size   = 512
lambda_timeout       = 60

# Out-of-band review notifications: set to the inbox that should receive
# review-decision emails, then accept the SNS confirmation email. Empty
# leaves the pipeline wired but with no email subscriber.
notification_email = ""

# Custom domain — frontend at web.<domain> (Amplify), Cognito hosted UI at
# login.<domain>. If another AWS account still globally claims the apex
# (Amplify), auth. (Cognito), cdn./www. (CloudFront), use the subdomain
# fallback pattern until those claims are released.
domain_name         = "example.com"
manage_www_redirect = false

# false aliases the apex A record to the EB ALB; true aliases it to
# amplify_cloudfront_dns (aws_route53_record.root in infra/main.tf).
amplify_cutover        = false
amplify_cloudfront_dns = ""

cognito_callback_urls = [
  "https://web.example.com/api/auth/callback/cognito",
  "http://localhost:3000/api/auth/callback/cognito",
]

cognito_logout_urls = [
  "https://web.example.com",
  "http://localhost:3000",
]

cors_allowed_origins = [
  "https://web.example.com",
  "http://localhost:3000",
]

# Master switch for the gated modules (EB, RDS, NAT GW, ALB records).
services_enabled = true
