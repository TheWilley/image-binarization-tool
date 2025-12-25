import { useState, useEffect, type ReactNode } from 'react';

interface Tab {
  label: string;
  key: string;
}

export default function Tabs({
  tabs,
  children,
  defaultTab,
}: {
  tabs: Tab[];
  children: { [key: string]: ReactNode };
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].key);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

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
      <div>
        {Object.keys(children).map((key, index) => (
          <div
            key={index}
            style={{ display: activeTab === tabs[index].key ? 'block' : 'none' }}
          >
            {children[key]}
          </div>
        ))}
      </div>
    </div>
  );
}
