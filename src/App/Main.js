import { useSelector, useDispatch } from 'react-redux';
import { Panel, HorizontalTab } from 'nexus-module';

import NewsFeed from './news';
import NamespaceFeed from './namespace';
import Profile from './profile';
import { switchTab } from '../actions/actionCreators';

export default function Main() {
  const activeTab = useSelector((state) => state.ui.activeTab);
  const dispatch = useDispatch();

  const handleSwitchTab = (tab) => {
    dispatch(switchTab(tab));
  };

  return (
    <Panel title="Distordia Social" icon={{ url: 'react.svg', id: 'icon' }}>
      <div className="text-center">
        <HorizontalTab.TabBar>
          <HorizontalTab
            active={activeTab === 'NewsFeed'}
            onClick={() => handleSwitchTab('NewsFeed')}
          >
            Social Feed
          </HorizontalTab>
          <HorizontalTab
            active={activeTab === 'NamespaceFeed'}
            onClick={() => handleSwitchTab('NamespaceFeed')}
          >
            Namespace Feed
          </HorizontalTab>
          <HorizontalTab
            active={activeTab === 'Profile'}
            onClick={() => handleSwitchTab('Profile')}
          >
            My Profile
          </HorizontalTab>
        </HorizontalTab.TabBar>
      </div>

      <div>{activeTab === 'NewsFeed' && <NewsFeed />}</div>
      <div>{activeTab === 'NamespaceFeed' && <NamespaceFeed />}</div>
      <div>{activeTab === 'Profile' && <Profile />}</div>
    </Panel>
  );
}
