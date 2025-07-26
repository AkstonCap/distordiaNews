import {
    SingleColRow,
    PageLayout,
    CatalogueTable,
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
} from 'nexus-module';

import { useSelector, useDispatch } from 'react-redux';

import {
    updateInput,
    setSelectedNamespace,
} from 'actions/actionCreators';

//import { createAsset } from 'actions/createAsset';

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

export default function NewsFeed() {

    const inputValue = useSelector((state) => state.ui.inputValue);
    const [news, setNews] = useState([]);

    const dispatch = useDispatch();

    const fetchAssets = async () => {
        
        // distordia-catalogue assets shall have the following fields:
        // 1. 
        // 5. status (active/inactive)
        // 6. distordia (yes/no)

        try {
            const result = await apiCall(
                'register/list/assets:asset'//,
                //{
                //    where: "results.distordia=yes;",
                //}
            ).catch((error) => {
                showErrorDialog({
                    message: 'Cannot get assets',
                    note: error?.message || 'Unknown error',
                });
            });
            
            if (result) {
                const resultNews = result.filter((item) => 
                    //item.distordia === '1.1'
                    item.distordia-status === 'official' &&
                    item.distordia-type === 'distordia-post'
                );
                //const resultActive = resultNews.filter((item) => item.status === '1');
                //setNews(resultActive);
                setNews(resultNews);
            }

        } catch (error) {
            showErrorDialog({
                message: 'Cannot get catalogue',
                note: error?.message || 'Unknown error',
            });
        }
    }

    useEffect(() => {

        fetchAssets();

    }, []);

    const handleChange = (e) => {
        dispatch(updateInput(e.target.value));
    };

    const [checkingAssets, setCheckingAssets] = useState(false);
    
    const viewAsset = async ( address ) => {
        
        if (checkingAssets) {
            return;
        }

        try {
            setCheckingAssets(true);
            const result = await apiCall(
                'register/get/assets:asset',
                 {
                    address: address,
                    //where: 'results.json.distordia=yes'
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

    const handleNamespaceClick = (namespace) => {
        dispatch(setSelectedNamespace(namespace));
    };

    const renderNewsFeed = (data) => {
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
                        handleNamespaceClick(item.namespace || item.address?.substring(0, 12));
                    }}
                >
                    @{item.namespace || item.address?.substring(0, 12)}...
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
            <div className="text-center">
                <SearchField
                    value={inputValue}
                    onChange={handleChange}
                    placeholder="Search"
                />
            </div>
        </SingleColRow>
        <SingleColRow>
            <div>
                <FieldSet legend="News Feed">
                    <div>
                        {renderNewsFeed(news)}
                    </div>
                </FieldSet>
            </div>
        </SingleColRow>
      </PageLayout>
    );
}
