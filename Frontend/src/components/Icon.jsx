function Icon({
  icon: IconComponent,
  size = 24,
  variant = "Linear",
  color = "currentColor",
  ...props
}) {
  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      variant={variant}
      color={color}
      {...props}
    />
  );
}

export default Icon;
