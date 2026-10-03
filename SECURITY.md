# Security policy

SahajLipi publishes experimental developer alphas. Version `0.1.0-alpha.1` was published on npm on 2026-10-03. The current alpha and public `main` branch receive best-effort fixes; there is no promised support window yet. See the [release record](docs/release.md) for the verified artifact and compatibility limits.

| Version | Security fixes |
| --- | --- |
| Current `main` | Best effort |
| `0.1.0-alpha.1` | Best effort; experimental |

## Report a vulnerability privately

Use **Report a vulnerability** on the repository's [Security Advisories page](https://github.com/ojastechnologies/sahajlipi/security/advisories). Private vulnerability reporting is enabled for this repository. Include the affected commit or URL, impact, and a minimal reproduction. Please give maintainers time to investigate before posting exploit details in a public issue.

For ordinary typing bugs or feature requests, open a [public issue](https://github.com/ojastechnologies/sahajlipi/issues) and follow [CONTRIBUTING.md](CONTRIBUTING.md). A misspelled conversion is usually a correctness issue rather than a security vulnerability.

The package engine has no network or persistent-storage code. Applications embedding it and the static demo's hosting environment have their own security boundaries; see the [package architecture](docs/package/architecture.md), [demo guide](docs/demo/README.md), and [development guide](docs/development.md).
