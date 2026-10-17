# vaerion — PyPI distribution


## PyPI naming strategy (decision of record, 2026-10-03)

Two Python distributions exist in this repository and they must not
collide on PyPI:

| Distribution | PyPI name | Provides | Source |
|---|---|---|---|
| CLI launcher wheel | `vaerion` | the `vae` console command | `packaging/python/` |
| SDK | `vaerion-sdk` | the `vaerion` import (Agent / VaeDaemonClient) | `sdks/python/` |

This mirrors the npm/JVM rows of record: npm `vaerion` (CLI) vs
`@vaerion/sdk`; Maven `dev.vaerion:vaerion-sdk`. The SDK import name
remains `vaerion` in both layouts. Registry publication of both
distributions remains Founder-gated; PyPI `vaerion` measured 404
(unclaimed) on 2026-10-03.

`pip install vaerion` installs the `vae` console launcher plus the packaged
engine source. Python is the delivery channel, not the substrate: the
launcher resolves the Bun runtime (ADR-0018) and `exec`s the engine's own
`main()` — identical exit codes and streaming behavior to every other
channel. A missing Bun runtime produces a taught error (E1600, exit 2)
with the exact install command for the detected OS, never a traceback.

```sh
pip install vaerion
vae --help
```

## Build the publishable wheel

```sh
sh packaging/python/make-package.sh
# -> dist/python/vaerion-<version>-py3-none-any.whl (+ sdist)
```

The wheel is an INPUT to publication (Founder-gated, risk-ledger F-5).
Offline verification without any registry:

```sh
python3 -m venv /tmp/vaerion-venv
/tmp/vaerion-venv/bin/pip install --no-deps dist/python/vaerion-<version>-py3-none-any.whl
/tmp/vaerion-venv/bin/vae --version
```
