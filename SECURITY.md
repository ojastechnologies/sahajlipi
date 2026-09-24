# Security policy

SahajLipi is an unreleased prototype. The public `main` branch receives best-effort fixes; there is no published npm version or promised support window yet.

| Version | Security fixes |
| --- | --- |
| Current `main` | Best effort |
| npm package | No release exists |

## Report a vulnerability privately

Use **Report a vulnerability** on the repository's [Security Advisories page](https://github.com/ojastechnologies/sahajlipi/security/advisories). Private vulnerability reporting is enabled for this repository. Include the affected commit or URL, impact, and a minimal reproduction. Please give maintainers time to investigate before posting exploit details in a public issue.

For ordinary typing bugs or feature requests, open a [public issue](https://github.com/ojastechnologies/sahajlipi/issues) and follow [CONTRIBUTING.md](CONTRIBUTING.md). A misspelled conversion is usually a correctness issue rather than a security vulnerability.

The current engine has no network or persistent storage code. Applications embedding it and the static demo's hosting environment have their own security boundaries; see the [architecture](docs/architecture.md) and [development guide](docs/development.md).
