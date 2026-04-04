import clsx from 'clsx'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  const count = quantity ?? 0

  return (
    <span
      className={clsx(
        'relative inline-flex items-center justify-center',
        className,
      )}
      {...rest}
    >
      <img
        src="/media/icons/shopping_bag.svg"
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0"
        aria-hidden
      />
      {count > 0 && (
        <span className="absolute top-1 right-1 size-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
          {count}
        </span>
      )}
    </span>
  )
}
