# Security Policy

## Supported Versions

We use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < x.x   | :x:                 |

## Reporting a Vulnerability

The Mifos community take security bugs seriously.
We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

> **Please do not report security vulnerabilities through public GitHub issues, Jira, Slack discussions, or pull requests.**. 

Instead, please report them by emailing:  

**security-disclosure@mifos.org**


Please include as much of the following information as possible to help us triage your report more quickly:

- Type of issue (e.g. SQL injection, cross-site scripting, authentication bypass, privilege escalation, insecure transaction handling, etc.)
- The repository and full path of the source file(s) related to the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## What to Expect

- **Acknowledgement:** We will acknowledge receipt of your report within **5 business days**.
- **Triage:** We will investigate and confirm the issue, and aim to provide an initial assessment within **10 business days**.
- **Resolution:** We will work with you to understand and resolve the issue promptly, and will keep you informed of progress toward a fix and full announcement. We resolve based on impact rather than when notified.
- **Disclosure:** We ask that you give us a reasonable amount of time to resolve the issue before any public disclosure. We will credit reporters who follow responsible disclosure practices, unless anonymity is requested. We do not provide Bounty payments for security issues but instead acknowledge contributors that assist us (unless anonymity is requested).

## Scope

This policy applies to the repositories under the [openMF](https://github.com/openMF) organization unless it is clearly marked as experimental not for production use.  

Given that Mifos supports Financial Services, we treat issues affecting the following with the highest priority:

- Authentication, authorization, and access control
- Transaction integrity, duplication, or replay
- Data exposure of payer/payee, account, or transaction details
- Injection vulnerabilities (SQL, command, etc.)
- Insecure deserialization or dependency vulnerabilities
- Misconfiguration of connectors to external payment schemes/rails

## Out of Scope

- Vulnerabilities in third-party dependencies that are already publicly disclosed and awaiting an upstream fix (please report these upstream)
- Denial-of-service issues requiring unreasonable amounts of traffic
- Issues that require physical access to a user's device
- Social engineering attacks

## Preferred Languages

We prefer all communications to be in English.

## Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit a security issue for purposes other than verification
- Report any vulnerability you've discovered promptly and do not disclose it to others until it has been resolved

We consider security research conducted under this policy to be authorized, and we will not pursue legal action for accidental, good-faith violations of this policy.
