import argparse
from pathlib import Path
from simulator import Simulator

def get_default_settings_file():
    """Returns the default settings file path."""
    base_folder = Path(__file__).resolve().parent.parent
    return base_folder / "config/settings.json"

def validate_file(file_path):
    """Validates that the provided path is a file."""
    print("file_path: ", file_path)
    path = Path(file_path)
    if not path.is_file():
        raise argparse.ArgumentTypeError(f"Can't open file: '{file_path}'")
    return path

def parse_arguments():
    """Parses command-line arguments."""
    parser = argparse.ArgumentParser(description="Run the simulator with a specific settings file.")
    parser.add_argument(
        "-f",
        "--file",
        dest="settings_file",
        type=validate_file,
        help="Path to the settings file.",
        default=get_default_settings_file(),
    )
    return parser.parse_args()

def main():
    """Main entry point of the program."""
    args = parse_arguments()
    simulator = Simulator(args.settings_file)
    simulator.run()

if __name__ == "__main__":
    main()
