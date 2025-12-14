import { useState, type ReactNode } from 'react';

interface Tab {
  label: string;
  key: string;
}

export default function Tabs({
  tabs,
  children,
}: {
  tabs: Tab[];
  children: { [key: string]: ReactNode };
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  return (
    <div>
      <div role='tablist' className='tabs tabs-border mb-2'>
        {tabs.map((tab) => (
          <a
            key={tab.key}
            role='tab'
            className={`tab ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </a>
        ))}
      </div>
      <div>{children[activeTab]}</div>
    </div>
  );
}
