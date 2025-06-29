import {
    apiCall,
    showSuccessDialog,
    showErrorDialog,
} from 'nexus-module';
import { useState } from 'react';

const [checkingAssets, setCheckingAssets] = useState(false);
    
export const viewAsset = async ( address ) => {
        
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