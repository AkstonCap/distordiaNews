import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiCall } from 'nexus-module';
import { switchExtNamespace } from 'actions/actionCreators';
import {
  fetchAllVerified,
  getTierForGenesis,
  formatAddress,
  formatTime,
} from '../utils/verification';
import {
  PageLayout,
  SingleColRow,
  SearchField,
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
  FilterBar,
  FilterGroup,
  FilterLabel,
  SmallButton,
  PrimaryButton,
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

export default function NamespaceFeed() {
  const extNamespace = useSelector(
    (state) => state.settings.namespaces.extNamespace
  );
  const dispatch = useDispatch();

  const [nsInput, setNsInput] = useState(extNamespace || 'distordia');
  const [posts, setPosts] = useState([]);
  const [verifiedMap, setVerifiedMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [assetData, setAssetData] = useState(null);

  const fetchNamespacePosts = useCallback(async (namespace) => {
    if (!namespace) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall('register/list/assets:asset', {
        where:
          'results.distordia-type=distordia-post AND results.distordia-status=official',
      });

      if (result) {
        const filtered = result.filter((item) => {
          const ns = item["Creator's namespace"] || '';
          return ns.toLowerCase() === namespace.toLowerCase();
        });
        filtered.sort((a, b) => (b.created || 0) - (a.created || 0));
        setPosts(filtered);
      } else {
        setPosts([]);
      }

      const verified = await fetchAllVerified();
      setVerifiedMap(verified);
    } catch (err) {
      setError(err?.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (extNamespace) {
      fetchNamespacePosts(extNamespace);
    }
  }, [extNamespace, fetchNamespacePosts]);

  const handleSearch = () => {
    if (nsInput.trim()) {
      dispatch(switchExtNamespace(nsInput.trim()));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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

  return (
    <PageLayout>
      <FilterBar>
        <FilterGroup>
          <FilterLabel>Namespace:</FilterLabel>
          <SearchField
            value={nsInput}
            onChange={(e) => setNsInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter namespace..."
          />
        </FilterGroup>
        <PrimaryButton onClick={handleSearch} disabled={loading}>
          Browse
        </PrimaryButton>
      </FilterBar>

      {extNamespace && (
        <SingleColRow>
          <div style={{ fontSize: 13, opacity: 0.6 }}>
            Showing posts from namespace:{' '}
            <strong style={{ color: '#00d4ff' }}>{extNamespace}</strong>
          </div>
        </SingleColRow>
      )}

      {loading && (
        <LoadingContainer>
          <Spinner />
          <p>Loading posts from {extNamespace}...</p>
        </LoadingContainer>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && posts.length === 0 && extNamespace && (
        <EmptyState>No posts found from namespace "{extNamespace}"</EmptyState>
      )}

      {!loading &&
        posts.map((post) => {
          const namespace = post["Creator's namespace"] || '';
          const owner = post.owner || '';
          const text = post.text || post.Text || '';
          const tier = getTierForGenesis(owner, verifiedMap);

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
                  {tier && <TierBadge tier={tier} />}
                  {post['distordia-status'] === 'official' && (
                    <BadgeOfficial>Official</BadgeOfficial>
                  )}
                </BadgeRow>
              </PostHeader>
              <PostText>{text}</PostText>
              <PostFooter>
                <PostMeta>
                  <span>{formatTime(post.created)}</span>
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
