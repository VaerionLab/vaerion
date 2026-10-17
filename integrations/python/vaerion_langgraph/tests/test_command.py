"""The vae-command resolution law, tested without touching the filesystem."""

from __future__ import annotations

import os
import unittest
from unittest import mock

from vaerion_langgraph import VaerionCommandError, resolve_vae_command


class TestCommandResolution(unittest.TestCase):
    def test_vae_bin_env_var_wins(self) -> None:
        with mock.patch.dict(os.environ, {"VAE_BIN": "fake vae --flag"}):
            self.assertEqual(resolve_vae_command(), ["fake", "vae", "--flag"])

    def test_path_lookup_second(self) -> None:
        env = {k: v for k, v in os.environ.items() if k != "VAE_BIN"}
        with mock.patch.dict(os.environ, env, clear=True):
            with mock.patch("shutil.which", return_value="/usr/local/bin/vae") as which:
                self.assertEqual(resolve_vae_command(), ["/usr/local/bin/vae"])
                which.assert_called_with("vae")

    def test_repo_bun_fallback_points_at_real_engine_entry(self) -> None:
        env = {k: v for k, v in os.environ.items() if k != "VAE_BIN"}
        real_which = __import__("shutil").which

        def which(name: str) -> str | None:
            return None if name == "vae" else real_which(name)

        with mock.patch.dict(os.environ, env, clear=True):
            with mock.patch("shutil.which", side_effect=which):
                argv = resolve_vae_command()
        self.assertEqual(argv[:2], ["bun", "run"])
        self.assertTrue(argv[2].endswith("packages/vaerion/src/cli/vae.ts"))

    def test_unresolvable_raises_with_the_e_code_contract(self) -> None:
        env = {k: v for k, v in os.environ.items() if k != "VAE_BIN"}
        with mock.patch.dict(os.environ, env, clear=True):
            with mock.patch("shutil.which", return_value=None):
                with mock.patch("pathlib.Path.exists", return_value=False):
                    with self.assertRaises(VaerionCommandError) as ctx:
                        resolve_vae_command()
        self.assertEqual(ctx.exception.code, "E1601")


if __name__ == "__main__":
    unittest.main()
