import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiCall } from 'nexus-module';
import { switchMyNamespace } from 'actions/actionCreators';
import {
  fetchAllVerified,
  getTierForGenesis,
  formatAddress,
  formatTime,
} from '../utils/verification';
import {
  PageLayout,
  SingleColRow,
  ProfileCard,
  ProfileNamespace,
  ProfileGenesis,
  ProfileStats,
  ProfileStat,
  PostCard,
  PostHeader,
  PostAuthor,
  PostNamespace,
  PostOwner,
  PostText,
  PostFooter,
  PostMeta,
  PostActions,
  BadgeRow,
  BadgeOfficial,
  TierBadgeL1,
  TierBadgeL2,
  TierBadgeL3,
  SmallButton,
  LoadingContainer,
  Spinner,
  EmptyState,
  ErrorMessage,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalClose,
  JsonBlock,
} from '../components/styles';

function TierBadge({ tier }) {
  switch (tier) {
    case 'L1':
      return <TierBadgeL1>Verified L1</TierBadgeL1>;
    case 'L2':
      return <TierBadgeL2>Verified L2</TierBadgeL2>;
    case 'L3':
      return <TierBadgeL3>Verified L3</TierBadgeL3>;
    default:
      return null;
  }
}

export default function Profile() {
  const myNamespace = useSelector(
    (state) => state.settings.namespaces.myNamespace
  );
  const dispatch = useDispatch();

  const [myPosts, setMyPosts] = useState([]);
  const [profileInfo, setProfileInfo] = useState(null);
  const [verifiedMap, setVerifiedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [assetData, setAssetData] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user's own assets (posts they own)
      const [assets, verified] = await Promise.all([
        apiCall('assets/list/asset').catch(() => []),
        fetchAllVerified(),
      ]);

      setVerifiedMap(verified);

      if (assets && Array.isArray(assets)) {
        const posts = assets.filter(
          (item) => item['distordia-type'] === 'distordia-post'
        );
        posts.sort((a, b) => (b.created || 0) - (a.created || 0));
        setMyPosts(posts);

        // Extract profile info from the first post or wallet data
        if (posts.length > 0) {
          const first = posts[0];
          const namespace = first["Creator's namespace"] || first.name?.split(':')[0] || '';
          if (namespace && namespace !== myNamespace) {
            dispatch(switchMyNamespace(namespace));
          }
          setProfileInfo({
            namespace: namespace || myNamespace || '',
            owner: first.owner || '',
            postCount: posts.length,
          });
        } else {
          setProfileInfo({
            namespace: myNamespace || '',
            owner: '',
            postCount: 0,
          });
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [myNamespace, dispatch]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const viewAsset = async (address) => {
    setViewingAsset(address);
    setAssetData(null);
    try {
      const result = await apiCall('register/get/assets:asset', { address });
      setAssetData(result);
    } catch (err) {
      setAssetData({ error: err?.message || 'Failed to load asset' });
    }
  };

  const tier = profileInfo
    ? getTierForGenesis(profileInfo.owner, verifiedMap)
    : null;

  return (
    <PageLayout>
      {loading && (
        <LoadingContainer>
          <Spinner />
          <p>Loading your profile...</p>
        </LoadingContainer>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && profileInfo && (
        <ProfileCard>
          <BadgeRow style={{ justifyContent: 'center', marginBottom: 12 }}>
            {tier && <TierBadge tier={tier} />}
          </BadgeRow>
          <ProfileNamespace>
            {profileInfo.namespace
              ? `@${profileInfo.namespace}`
              : 'No Namespace'}
          </ProfileNamespace>
          {profileInfo.owner && (
            <ProfileGenesis>{profileInfo.owner}</ProfileGenesis>
          )}
          <ProfileStats>
            <ProfileStat>
              <div className="stat-value">{profileInfo.postCount}</div>
              <div className="stat-label">Posts</div>
            </ProfileStat>
          </ProfileStats>
        </ProfileCard>
      )}

      {!loading && (
        <SingleColRow>
          <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>
            Your Posts
          </div>
        </SingleColRow>
      )}

      {!loading && myPosts.length === 0 && (
        <EmptyState>
          You haven't created any posts yet. Switch to the Social Feed tab to
          create your first post!
        </EmptyState>
      )}

      {!loading &&
        myPosts.map((post) => {
          const namespace = post["Creator's namespace"] || '';
          const owner = post.owner || '';
          const text = post.text || post.Text || '';
          const postTier = getTierForGenesis(owner, verifiedMap);

          return (
            <PostCard key={post.address} onClick={() => viewAsset(post.address)}>
              <PostHeader>
                <PostAuthor>
                  <PostNamespace>
                    @{namespace || formatAddress(owner, 12)}
                  </PostNamespace>
                  <PostOwner>{formatAddress(owner, 16)}</PostOwner>
                </PostAuthor>
                <BadgeRow>
                  {postTier && <TierBadge tier={postTier} />}
                  {post['distordia-status'] === 'official' && (
                    <BadgeOfficial>Official</BadgeOfficial>
                  )}
                </BadgeRow>
              </PostHeader>
              <PostText>{text}</PostText>
              <PostFooter>
                <PostMeta>
                  <span>{formatTime(post.created)}</span>
                  <span>{formatAddress(post.address, 12)}</span>
                </PostMeta>
                <PostActions>
                  <SmallButton
                    onClick={(e) => {
                      e.stopPropagation();
                      viewAsset(post.address);
                    }}
                  >
                    On-chain
                  </SmallButton>
                </PostActions>
              </PostFooter>
            </PostCard>
          );
        })}

      {viewingAsset && (
        <ModalOverlay onClick={() => setViewingAsset(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>On-Chain Asset Data</h3>
              <ModalClose onClick={() => setViewingAsset(null)}>
                &times;
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              {assetData ? (
                <JsonBlock>{JSON.stringify(assetData, null, 2)}</JsonBlock>
              ) : (
                <LoadingContainer>
                  <Spinner />
                  <p>Loading...</p>
                </LoadingContainer>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageLayout>
  );
}
