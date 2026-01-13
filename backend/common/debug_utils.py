def print_parameters(prefix="", **kwargs):
    for param_name, param_value in kwargs.items():
        print(f" ========== {prefix}{param_name} ========== : {param_value}")
    print()