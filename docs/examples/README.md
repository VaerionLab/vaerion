# Examples — real, executed, test-backed

Every example in this repository is **executed by the test suite**. Nothing here is
decorative; if an example stops working, the battery goes red.

## `examples/vaerion-demo`

The guided demo: deterministic retrieval over a tiny source set with a full
journal trail.

- [`DEMO.md`](../../examples/vaerion-demo/DEMO.md) — the walkthrough
- sources: `determinism.md`, `journal.md`
- manifest: `vaerion.yaml`

## `examples/vaerion/demo-workspace`

A minimal workspace you can copy: manifest, plan, and workflow JSON.

- [`README.md`](../../examples/vaerion/README.md)
- `demo-workspace/` — `vaerion.yaml` · `plans/echo-plan.json` · `workflow.json`

## Run one

```sh
cp -r examples/vaerion/demo-workspace my-first-run && cd my-first-run
vae run demo
vae journal verify <run_id>
```

Measured journey and expected output: [quickstart](../quickstart/README.md).

## Write your own

Start from the demo manifest, then read the workflow guide
([book/tutorials/03-workflow](../book/tutorials/03-workflow.md)) and the
extension kit ([book/guides/extension-kit](../book/guides/extension-kit.md)).
