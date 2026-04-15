import { useMemo, useState } from "react";
import clsx from "clsx";
import ListItem from "../ListItem/ListItem.jsx";

function CommentPanel({
  className,
  title = "Comentarios",
  actionLabel = "Marcar todo como leído",
  footerLabel = "Ver todos los comentarios",
  items = [],
  onHeaderAction,
  onFooterAction,
  ...props
}) {
  const [readIds, setReadIds] = useState([]);

  const resolvedItems = useMemo(() => {
    return items.map((item, index) => {
      const itemId = item.id ?? index;
      const isRead = readIds.includes(itemId);

      return {
        ...item,
        id: itemId,
        state: isRead ? "Read" : "Default",
      };
    });
  }, [items, readIds]);

  const handleMarkAsRead = (itemId) => {
    setReadIds((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    );
  };

  const handleMarkAllAsRead = () => {
    const allIds = items.map((item, index) => item.id ?? index);
    setReadIds(allIds);
    onHeaderAction?.();
  };

  return (
    <section
      className={clsx(
        "flex w-[394px] flex-col items-start overflow-hidden rounded-[16px] border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)]",
        className,
      )}
      {...props}
    >
      <div className="flex w-full items-center justify-between border-b border-[var(--color-neutral-300)] px-[24px] py-[20px]">
        <h3 className="text-heading-7 text-[var(--color-text-300)]">{title}</h3>

        <button
          type="button"
          className="text-body-3 text-[var(--color-text-100)]"
          onClick={handleMarkAllAsRead}
        >
          {actionLabel}
        </button>
      </div>

      <div className="flex w-full flex-col">
        {resolvedItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => handleMarkAsRead(item.id)}
            className="w-full cursor-pointer"
          >
            <ListItem
              {...item}
              className="w-full"
              showDivider={index !== resolvedItems.length - 1}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center border-t border-[var(--color-neutral-300)] px-[24px] py-[20px] text-body-3 text-[var(--color-text-100)]"
        onClick={onFooterAction}
      >
        {footerLabel}
      </button>
    </section>
  );
}

export default CommentPanel;
