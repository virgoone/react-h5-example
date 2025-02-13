import { useState } from 'react';

import Marquee from '@/components/marquee';
import MarqueeTouch from '@/components/marquee-touch';

import './style.less';

export default function MarqueePage() {
  const [isIOS] = useState(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent));
  const [items] = useState(Array.from({ length: 20 }));
  const duration = items.length * 1.5;

  return (
    <div className="marquee-page">
      <div className="header-img">
        <div className="title"></div>
      </div>
      <div className="content">
        <div className="module-content">
          <div className="book-view-scroll">
            <div className="wrap">
              <div
                className={`scroll-wrap ${isIOS ? 'ios' : 'not-ios'}`}
                style={{ '--duration': `${duration}s` } as React.CSSProperties}
              >
                <div className="wrap flex row overflow-hidden">
                  <Marquee repeat={2}>
                    {items.map((_, index) => (
                      <div key={index} className="module-item">
                        <div className="module-item-content"></div>
                      </div>
                    ))}
                  </Marquee>
                </div>
              </div>
            </div>
          </div>

          <div className="book-view-scroll">
            <div className="wrap">
              <div
                className={`scroll-wrap ${isIOS ? 'ios' : 'not-ios'}`}
                style={{ '--duration': `${duration}s` } as React.CSSProperties}
              >
                <div className="wrap flex row overflow-hidden">
                  <MarqueeTouch repeat={2}>
                    {items.map((_, index) => (
                      <div key={index} className="module-item">
                        <div className="module-item-content"></div>
                      </div>
                    ))}
                  </MarqueeTouch>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
