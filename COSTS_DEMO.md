# Live Demonstration Deployment Costs

Estimated on August 10, 2026 for a low-traffic deployment in a European region.
Prices exclude VAT and assume 24/7 availability, HTTPS, a small product catalog,
Stripe test mode, and light demonstration traffic.

## Summary

| Deployment | Likely monthly cost | Safe monthly budget |
|---|---:|---:|
| Azure Container Apps + Static Web Apps + MongoDB Atlas Flex | $24-30 (about EUR 22-27) | $50 (about EUR 46) |
| AWS App Runner + ECS/Chroma + MongoDB Atlas Flex | $30-36 (about EUR 27-33) | $60 (about EUR 55) |
| AWS 4 GB Lightsail VM + MongoDB Atlas Flex | $34-56 (about EUR 31-51) | $60 (about EUR 55) |

The managed architectures cover:

- React static SPA hosting
- Spring Boot API hosting
- A persistent Chroma container
- MongoDB Atlas
- TLS and DNS
- Basic logging
- Approximately 10 GB of storage

MongoDB Atlas M0 can reduce the monthly cost by about $8, but its 512 MB
storage limit and lack of backups make it risky for this application because
product image bytes are currently stored in MongoDB.

## Variable Costs

| Item | Estimate |
|---|---:|
| Domain registration | $12-20/year |
| OpenAI image descriptions and embeddings | Usually under $1/month; budget $5 |
| Stripe test mode | Free |
| Stripe live European card payments | Approximately 1.5% + EUR 0.25 per transaction |
| Demo-scale traffic and logs | Normally within free allowances |
| Small Chroma backups | Approximately $0-2/month |

OpenAI costs depend on the configured models, image sizes, prompts, and actual
usage. Azure Monitor can become relatively expensive if verbose application
logging exceeds its free allowance.

## Estimated Deployment Effort

Estimate for one engineer familiar with Docker and the selected cloud.

| Work | Azure | AWS managed | AWS Lightsail |
|---|---:|---:|---:|
| Containerize Spring Boot and Chroma | 6-10 h | 6-10 h | 6-10 h |
| Provision hosting, networking, and persistent storage | 8-12 h | 12-18 h | 5-8 h |
| Configure MongoDB, secrets, TLS, CORS, and cookies | 5-8 h | 5-8 h | 5-8 h |
| CI/CD, seed data, and end-to-end checks | 8-12 h | 8-12 h | 8-12 h |
| **Total** | **27-42 h / 4-6 days** | **31-48 h / 5-7 days** | **24-38 h / 3-5 days** |

Additional effort:

- Add 2-4 days to migrate product images from MongoDB to S3 or Azure Blob Storage.
- Add 1-2 days for complete infrastructure-as-code, monitoring alerts, and
  automated backups.

## Recommendation

Use **Azure Container Apps** for the lowest-cost managed deployment. It supports
Azure Files mounts for Chroma persistence, while Azure Static Web Apps can host
the frontend with managed TLS.

For the fastest one-off demonstration, use a single **AWS Lightsail 4 GB
instance** for Spring Boot and Chroma, while keeping MongoDB in Atlas. This is
less sophisticated but has fewer cloud resources to configure and troubleshoot.

Avoid relying on MongoDB Atlas M0 unless the catalog is deliberately kept very
small. Atlas Flex is a safer demonstration default. Keep Stripe in test mode,
set an OpenAI usage limit, and configure a cloud billing alert.

## Pricing References

- [AWS Lightsail pricing](https://aws.amazon.com/lightsail/pricing/)
- [AWS App Runner pricing](https://aws.amazon.com/apprunner/pricing/)
- [AWS Fargate pricing](https://aws.amazon.com/fargate/pricing/)
- [AWS CloudFront pricing](https://aws.amazon.com/cloudfront/pricing/)
- [AWS Route 53 pricing](https://aws.amazon.com/route53/pricing/)
- [Azure Container Apps pricing](https://azure.microsoft.com/en-us/pricing/details/container-apps/)
- [Azure Static Web Apps pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/static/)
- [Azure Files pricing](https://azure.microsoft.com/en-us/pricing/details/storage/files/)
- [Azure DNS pricing](https://azure.microsoft.com/en-us/pricing/details/dns/)
- [MongoDB Atlas pricing](https://www.mongodb.com/pricing)
- [OpenAI API pricing](https://openai.com/api/pricing/)
- [Stripe pricing](https://stripe.com/pricing)

Cloud prices, exchange rates, free-tier eligibility, and regional availability
can change. Confirm the final configuration in the relevant cloud pricing
calculator before provisioning.
