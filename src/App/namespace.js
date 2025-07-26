import {
    SingleColRow,
    PageLayout,
} from '../components/styles';

import { useState, useEffect } from 'react';
import styled from '@emotion/styled';

import {
    FieldSet,
    apiCall,
    showSuccessDialog,
    showErrorDialog,
    TextField,
    Button,
    Modal,
    Select,
} from 'nexus-module';

import { useSelector, useDispatch } from 'react-redux';

import {
    setSelectedNamespace,
} from 'actions/actionCreators';

const SearchField = styled(TextField)({
    maxWidth: 200,
});

const NewsPost = styled.div({
    backgroundColor: '#ffffff',
    border: '1px solid #e1e8ed',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: '#f7f9fa',
        borderColor: '#1da1f2',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(29, 161, 242, 0.15)',
    }
});

const PostHeader = styled.div({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
});

const UserInfo = styled.div({
    display: 'flex',
    flexDirection: 'column',
});

const UserName = styled.span({
    fontWeight: 'bold',
    color: '#1da1f2',
    fontSize: '15px',
    cursor: 'pointer',
    '&:hover': {
        textDecoration: 'underline',
    }
});

const PostTime = styled.span({
    color: '#657786',
    fontSize: '13px',
    marginTop: '2px',
});

const PostContent = styled.div({
    fontSize: '15px',
    lineHeight: '1.5',
    color: '#14171a',
    marginBottom: '12px',
    wordWrap: 'break-word',
});

const PostFooter = styled.div({
    borderTop: '1px solid #e1e8ed',
    paddingTop: '8px',
});

const AssetAddress = styled.span({
    color: '#657786',
    fontSize: '12px',
    fontFamily: 'monospace',
});

const NamespaceInfo = styled.div({
    backgroundColor: '#f0f8ff',
    border: '1px solid #1da1f2',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    textAlign: 'center',
});

const ClearButton = styled(Button)({
    marginLeft: '10px',
    backgroundColor: '#657786',
    '&:hover': {
        backgroundColor: '#14171a',
    }
});

export default function NamespaceFeed() {

    const selectedNamespace = useSelector((state) => state.settings.namespaces.selectedNamespace);
    const [namespacePosts, setNamespacePosts] = useState([]);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    const fetchNamespacePosts = async (namespace) => {
        if (!namespace) {
            setNamespacePosts([]);
            return;
        }

        setLoading(true);
        try {
            const result = await apiCall(
                'register/list/assets:asset'
            ).catch((error) => {
                showErrorDialog({
                    message: 'Cannot get namespace assets',
                    note: error?.message || 'Unknown error',
                });
            });
            
            if (result) {
                const namespacePosts = result.filter((item) => 
                    item['distordia-status'] === 'official' &&
                    item['distordia-type'] === 'distordia-post' &&
                    item.namespace === namespace
                );
                setNamespacePosts(namespacePosts);
            }

        } catch (error) {
            showErrorDialog({
                message: 'Cannot get namespace posts',
                note: error?.message || 'Unknown error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNamespacePosts(selectedNamespace);
    }, [selectedNamespace]);

    const handleNamespaceClick = (namespace) => {
        dispatch(setSelectedNamespace(namespace));
    };

    const clearNamespace = () => {
        dispatch(setSelectedNamespace(null));
    };

    const [checkingAssets, setCheckingAssets] = useState(false);
    
    const viewAsset = async (address) => {
        if (checkingAssets) {
            return;
        }

        try {
            setCheckingAssets(true);
            const result = await apiCall(
                'register/get/assets:asset',
                 {
                    address: address,
                 }
            );
            showSuccessDialog({
                message: 'Asset Details',
                note: JSON.stringify(result, null, 2),
            });
        } catch (error) {
            showErrorDialog({
                message: 'Cannot get asset details',
                note: error?.message || 'Unknown error',
            });
        } finally {
            setCheckingAssets(false);
        }
    };

    const renderNamespaceFeed = (data) => {
        if (!Array.isArray(data)) {
          return null;
        }
        return data.map((item, index) => (
          <NewsPost
            key={index}
            onClick={(e) => {
                // Prevent namespace click when clicking on the post
                if (e.target.closest('.username')) return;
                viewAsset(item.address);
            }}
          >
            <PostHeader>
              <UserInfo>
                <UserName 
                    className="username"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNamespaceClick(item.namespace);
                    }}
                >
                    @{item.namespace}
                </UserName>
                <PostTime>{new Date(item.created * 1000).toLocaleString()}</PostTime>
              </UserInfo>
            </PostHeader>
            <PostContent>
              {item.text}
            </PostContent>
            <PostFooter>
              <AssetAddress>Asset: {item.address}</AssetAddress>
            </PostFooter>
          </NewsPost>
        ));
    };

    
    return (
      <PageLayout>
        <SingleColRow>
            {selectedNamespace && (
                <NamespaceInfo>
                    <strong>Viewing posts from namespace: @{selectedNamespace}</strong>
                    <ClearButton onClick={clearNamespace}>
                        Show All
                    </ClearButton>
                </NamespaceInfo>
            )}
            {!selectedNamespace && (
                <NamespaceInfo>
                    <strong>Click on any @username in the main newsfeed to filter posts by that namespace</strong>
                </NamespaceInfo>
            )}
        </SingleColRow>
        <SingleColRow>
            <div>
                <FieldSet legend={selectedNamespace ? `Posts from @${selectedNamespace}` : "Namespace Feed"}>
                    {loading && <div style={{textAlign: 'center', padding: '20px'}}>Loading...</div>}
                    {!loading && namespacePosts.length === 0 && selectedNamespace && (
                        <div style={{textAlign: 'center', padding: '20px', color: '#657786'}}>
                            No posts found from @{selectedNamespace}
                        </div>
                    )}
                    {!loading && namespacePosts.length === 0 && !selectedNamespace && (
                        <div style={{textAlign: 'center', padding: '20px', color: '#657786'}}>
                            Select a namespace to view their posts
                        </div>
                    )}
                    <div>
                        {renderNamespaceFeed(namespacePosts)}
                    </div>
                </FieldSet>
            </div>
        </SingleColRow>
      </PageLayout>
    );
}
