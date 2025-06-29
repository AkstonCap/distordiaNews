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
} from 'actions/actionCreators';

//import { createAsset } from 'actions/createAsset';

const SearchField = styled(TextField)({
    maxWidth: 200,
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

    const renderNewsTable = (data) => {
        if (!Array.isArray(data)) {
          return null;
        }
        return data.map((item, index) => (
          <CatalogueTable
          key={index}
          onClick={() => viewAsset(item.address)}
          >
          <td>{ item.address }</td>
          <td>{ item.text }</td>
          </CatalogueTable>
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
            <div className="text-center">
                <FieldSet legend="News Feed">
                    <tbody>
                        {renderNewsTable(news)}
                    </tbody>
                </FieldSet>
            </div>
        </SingleColRow>
      </PageLayout>
    );
}
