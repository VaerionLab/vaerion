# Quickstart — your first verified receipt

The whole journey is five commands. Numbers below are from a real measured run
(npm-shim install path, cold directory); the full transcript with screenshots is
[`docs/launch/demo-flow.md`](../launch/demo-flow.md).

## 1. Create the project

```sh
vae init --template demo
```

Creates `vaerion.yaml` (the manifest) and `.vaerion/journal` (the evidence store).
Measured: exit 0, ~0.1 s.

## 2. Run the demo agent

```sh
vae run demo
```

The engine executes the demo workflow, writes the journal, folds a receipt.
Measured: exit 0, ~0.12 s, run `crn_run_01M3DJKYSV7PCYBNQABHB6W7F6`.

## 3. Verify the evidence

```sh
vae journal verify <run_id>
```

Measured output (excerpt):

```
report:
  ok: true
  records: 14
  events: 10
  torn: false
  headHash: 5d85a840948c868f469e400a60de403f743104fca8c9f58f01979227010dce04
```

**That is the moment the product happens**: the run is no longer a story — it is
hash-chained evidence you just verified yourself.

## 4. Check the environment

```sh
vae doctor
```

Measured: exit 0, 14/14 checks ok.

## What the refusals teach

Vaerion fails **closed** and its errors teach:

- `vae journal verify` with no run id → `E1600 … Fix: Re-run with --help; help
  always teaches and never executes.`
- `vae init` inside an engine workspace → refused with the workspace guard.

Both refusals are recorded in the launch demo flow as designed behavior.

## Next

- What a receipt is made of: [receipts](../receipts/README.md)
- Day-to-day operation: [runtime](../runtime/README.md)
- The fuller tutorial track: [`docs/book/tutorials/`](../book/README.md) and the
  reference [`QUICKSTART`](../QUICKSTART.md)
