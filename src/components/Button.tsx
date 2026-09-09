import type { ButtonHTMLAttributes } from 'react'
import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  )
}
