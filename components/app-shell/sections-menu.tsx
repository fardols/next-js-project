"use client";

import {
  Dropdown,
  DropdownLabel,
  DropdownLink,
  DropdownSeparator,
} from "@/components/ui/dropdown";

const SECTIONS = [
  {
    title: "Справочники",
    items: [
      {
        href: "/clients",
        label: "Клиенты",
        description: "Карточки контрагентов, поиск по наименованию и коду",
      },
    ],
  },
  {
    title: "Реестры",
    items: [
      {
        href: "/deals",
        label: "Сделки",
        description: "Реестр сделок с фильтром по периоду и клиенту",
      },
    ],
  },
] as const;

/** Drop-down меню разделов приложения. */
export function SectionsMenu() {
  return (
    <Dropdown label="Разделы">
      {(close) =>
        SECTIONS.map((section, index) => (
          <div key={section.title}>
            {index > 0 ? <DropdownSeparator /> : null}
            <DropdownLabel>{section.title}</DropdownLabel>
            {section.items.map((item) => (
              <DropdownLink
                key={item.href}
                href={item.href}
                onSelect={close}
                description={item.description}
              >
                {item.label}
              </DropdownLink>
            ))}
          </div>
        ))
      }
    </Dropdown>
  );
}
