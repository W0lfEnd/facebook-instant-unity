using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine;

namespace FBInstant
{
    public class FBInstantBridge : MonoBehaviour
    {
        [DllImport("__Internal")]
        private static extern void HelloString(string str);


        [DllImport("__Internal")]
        private static extern void FBGetSupportedAPIs();
        public void LogGetSupportedAPIs()
        {
            FBGetSupportedAPIs();
        }


        [DllImport("__Internal")]
        private static extern void FBGetFriends(string bridgeName, string callbackName);
        private Action<string> _onFriendsFetched;
        public void GetFriendsAsync(Action<string> callback)
        {
            _onFriendsFetched = callback;
            FBGetFriends(name, nameof(SetFriends));
        }
        public void SetFriends(string friends)
        {
            if (_onFriendsFetched != null) _onFriendsFetched(friends);
            _onFriendsFetched = null;
        }


        [DllImport("__Internal")]
        private static extern void FBGetPaymentsCatalog(string bridgeName, string successCallback, string errorCallback);
        private Action<string> _onPaymentsCatalogFetched;
        public void GetPaymentsCatalog(Action<string> callback)
        {
            _onPaymentsCatalogFetched = callback;
            FBGetPaymentsCatalog(name, nameof(SetPaymentsCatalog), nameof(PaymentsCatalogError));
        }
        public void SetPaymentsCatalog(string catalog)
        {
            if (_onPaymentsCatalogFetched != null) _onPaymentsCatalogFetched(catalog);
            _onPaymentsCatalogFetched = null;
        }
        public void PaymentsCatalogError(string error)
        {
            Debug.LogError(error);
        }

        [DllImport("__Internal")]
        private static extern void FBPurchase(string itemId, string bridgeName, string successCallback, string errorCallback);
        private Action<string> _purchaseSuccess;
        private Action<string> _purchaseFail;

        public void PurchaseAsync(string itemId, Action<string> purchaseSuccess, Action<string> purchaseFail)
        {
            _purchaseSuccess = purchaseSuccess;
            _purchaseFail = purchaseFail;
            FBPurchase(itemId, name, nameof(PurchaseSuccess), nameof(PurchaseError));
        }
        public void PurchaseSuccess(string success)
        {
            if (_purchaseSuccess != null) _purchaseSuccess(success);
            _purchaseSuccess = null;
        }
        public void PurchaseError(string error)
        {
            Debug.LogError(error);
            if(_purchaseFail!=null) _purchaseFail(error);
            _purchaseFail = null;
        }


        [DllImport("__Internal")]
        private static extern void FBGetUserPurchases(string bridgeName, string successCallback);
        private Action<string> _getUserPurchasesSuccess;
        public void GetUserPurchasesSuccess(Action<string> callback)
        {
            _getUserPurchasesSuccess = callback;
            FBGetUserPurchases(name, nameof(UnconsumedUserPurchasesLoaded));
        }
        public void UnconsumedUserPurchasesLoaded(string result)
        {
            if (_getUserPurchasesSuccess != null) _getUserPurchasesSuccess(result);
            _getUserPurchasesSuccess = null;
        }


        [DllImport("__Internal")]
        private static extern void FBConsumePurchase(string purchaseToken);
        public void ConsumePurchase(string purchaseToken)
        {
            FBConsumePurchase(purchaseToken);
        }

        [DllImport("__Internal")]
        private static extern void FBGetData(string dataKeys, string bridgeName, string successCallback);
        private Action<string> _getData;

        public void GetDataAsync(List<string> dataKeys, Action<string> callback)
        {
            _getData = callback;
            var keys = string.Join(',', dataKeys);
            FBGetData(keys, name, nameof(SetFetchedData));
        }
        public void SetFetchedData(string result)
        {
            if (_getData != null) _getData(result);
            _getData = null;
        }

        [DllImport("__Internal")]
        private static extern void FBSetData(string data);
        public void SetData(string data)
        {
            FBSetData(data);
        }

        //TODO: add implementation for:
        //  FBShare, FBChooseAsync, FBPreloadRewardedVideo, FBHandleAdsNoFill, FBShowRewardedVideo, FBPreloadInterstitial
        //  FBHandleAdsNoFillInterstitial, FBShowInterstitial, FBCreateShortcutAsync, FBUpdateAsync

        private void Start()
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            HelloString("@#$ Say, Hello!");
#endif
        }
    }
}
