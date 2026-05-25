import importlib.util
from pathlib import Path


def test_airflow_dags_importable():
  for dag_file in Path(__file__).parents[1].joinpath("dags").glob("*.py"):
    spec = importlib.util.spec_from_file_location(dag_file.stem, dag_file)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
