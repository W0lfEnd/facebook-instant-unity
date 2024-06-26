mergeInto(LibraryManager.library, {

    HelloString: function (str) {
        console.log(UTF8ToString(str));
    },

    FBGetSupportedAPIs: function () {
        var supportedApiList = FBInstant.getSupportedAPIs();
        console.log('supported APIs: ' + JSON.stringify(supportedApiList));
    },

    FBGetFriends: function (bridgeName, successCallback) {
        var bridgeNameStr = UTF8ToString(bridgeName);
        var successCallbackStr = UTF8ToString(successCallback);

        FBInstant.player.getConnectedPlayersAsync()
            .then(function (players) { 
                unityPlayerInstance.SendMessage(bridgeNameStr, successCallbackStr, JSON.stringify(players)); 
            });
    },

    FBGetPaymentsCatalog: function (bridgeName, successCallback, errorCallback) {
        var bridgeNameStr = UTF8ToString(bridgeName);
        var successCallbackStr = UTF8ToString(successCallback);
        var errorCallbackStr = UTF8ToString(errorCallback);

        FBInstant.payments.getCatalogAsync()
            .then(function (catalog) {
                unityPlayerInstance.SendMessage(bridgeNameStr, successCallbackStr, JSON.stringify(catalog));
            })
            .catch(function (error) {
                unityPlayerInstance.SendMessage(bridgeNameStr, errorCallbackStr, JSON.stringify(error));
            });
    },

    FBPurchase: function (itemId, bridgeName, successCallback, errorCallback) {
        var productId = UTF8ToString(itemId);
        var bridgeNameStr = UTF8ToString(bridgeName);
        var successCallbackStr = UTF8ToString(successCallback);
        var errorCallbackStr = UTF8ToString(errorCallback);

        FBInstant.payments.purchaseAsync({
            productID: productId,
            developerPayload: 'foobar',
        })
        .then(function (purchase) {
            unityPlayerInstance.SendMessage(bridgeNameStr, successCallbackStr, JSON.stringify(purchase));
        })
        .catch(function (error) {
            unityPlayerInstance.SendMessage(bridgeNameStr, errorCallbackStr, JSON.stringify(error));
        });
    },

    FBGetUserPurchases: function (bridgeName, successCallback) {
        var bridgeNameStr = UTF8ToString(bridgeName);
        var successCallbackStr = UTF8ToString(successCallback);
        
        FBInstant.payments.getPurchasesAsync()
            .then(function (purchases) {
                unityPlayerInstance.SendMessage(bridgeNameStr, successCallbackStr, JSON.stringify(purchases));
            });
    },

    FBConsumePurchase: function (purchaseToken) {
        FBInstant.payments.consumePurchaseAsync(UTF8ToString(purchaseToken))
        .then(function () {
            console.log("Purchase successfully consumed!")
        })
        .catch(function (error) {
            console.error("Error consuming purchase: " + error);
        });
    },

    FBShare: function (text, picture) {
        FBInstant.shareAsync({
            image: Pointer_stringify(picture),
            text: Pointer_stringify(text),
            data: {shareUserId: FBInstant.context.getID()},
        })
        .then(function () {
            // continue with the game.
        });
    },

    FBChooseAsync: function () {
        console.log("Old id: " + FBInstant.context.getID());
        FBInstant.context.chooseAsync()
            .then(function () {
                console.log("New id: " + FBInstant.context.getID());
            });
    },

    FBPreloadRewardedVideo: function (adPlacement) {
        var placementId = '';

        if (adPlacement == 0) {
            placementId = 'qwe123'; // Meta
        } else if (adPlacement == 1) {
            placementId = 'asd123'; // Level complete
        } else {
            placementId = 'zxc123'; // Get continue
        }
        
        FBInstant.getRewardedVideoAsync(placementId)
            .then(function (rewarded) {
                // Load the Ad asynchronously

                if (adPlacement == 0) {
                    this.preloadedRewardedMeta = rewarded;
                } else if (adPlacement == 1) {
                    this.preloadedRewardedLevelComplete = rewarded;
                } else {
                    this.preloadedRewardedGetContinue = rewarded;
                }
                
                return rewarded.loadAsync();
            })
            .then(function () {
                unityPlayerInstance.SendMessage('FBAPI', 'RewardVideoPreloaded', adPlacement);
            })
            .catch(function (err) {
                console.error('Rewarded video failed to preload: ' + err.message);

                var data = {
                    placement: adPlacement,
                    message: err.message,
                };

                unityPlayerInstance.SendMessage('FBAPI', 'RewardVideoLoadError', JSON.stringify(data));
            });
    },

    FBHandleAdsNoFill: function (adPlacement) {

        var preloadedRewarded = null;

        if (adPlacement == 0) {
            preloadedRewarded = this.preloadedRewardedMeta;
        } else if (adPlacement == 1) {
            preloadedRewarded = this.preloadedRewardedLevelComplete;
        } else {
            preloadedRewarded = this.preloadedRewardedGetContinue;
        }
        
        if (preloadedRewarded == null) {
            var data = {
                placement: adPlacement,
                message: err.message,
            };

            unityPlayerInstance.SendMessage('FBAPI', 'RewardVideoLoadError', JSON.stringify(data));

            return;
        }

        preloadedRewarded.loadAsync()
            .then(function () {
                unityPlayerInstance.SendMessage('FBAPI', 'RewardVideoPreloaded', adPlacement);
            })
            .catch(function (err) {
                console.error('Video ad failed to preload: ' + err.message);

                var data = {
                    placement: adPlacement,
                    message: err.message,
                };

                unityPlayerInstance.SendMessage('FBAPI', 'RewardVideoLoadError', JSON.stringify(data));
            });
    },

    FBShowRewardedVideo: function (adPlacement) {
        var preloadedRewarded = null;

        if (adPlacement == 0) {
            preloadedRewarded = this.preloadedRewardedMeta;
        } else if (adPlacement == 1) {
            preloadedRewarded = this.preloadedRewardedLevelComplete;
        } else {
            preloadedRewarded = this.preloadedRewardedGetContinue;
        }

        if (preloadedRewarded == null) {
            var data = {
                placement: adPlacement,
                message: err.message,
            };

            unityPlayerInstance.SendMessage('FBAPI', 'RewardVideoWatchError', JSON.stringify(data));

            return;
        }

        preloadedRewarded.showAsync()
            .then(function () {
                // Perform post-ad success operation
                console.log('Rewarded video watched successfully');
                unityPlayerInstance.SendMessage('FBAPI', 'RewardVideoWatched', adPlacement);
            })
            .catch(function (e) {
                console.error(e.message);

                var data = {
                    placement: adPlacement,
                    message: err.message,
                };

                unityPlayerInstance.SendMessage('FBAPI', 'RewardVideoWatchError', JSON.stringify(data));
            });
    },

    FBPreloadInterstitial: function () {
        FBInstant.getInterstitialAdAsync('qwe123')
            .then(function (interstitial) {
                this.preloadedInterstitial = interstitial;
                return interstitial.loadAsync();
            })
            .then(function () {
                console.log('Interstitial preloaded');
                unityPlayerInstance.SendMessage('FBAPI', 'InterstitialPreloaded');
            })
            .catch(function (err) {
                console.error('Interstitial failed to preload: ' + err.message);
                unityPlayerInstance.SendMessage('FBAPI', 'InterstitialLoadError', JSON.stringify(err.message));
            });
    },

    FBHandleAdsNoFillInterstitial: function () {
        if (this.preloadedInterstitial == null) {
            unityPlayerInstance.SendMessage('FBAPI', 'InterstitialLoadError', "Preloaded is null");
            return;
        }

        this.preloadedInterstitial.loadAsync()
            .then(function () {
                console.log('Interstitial preloaded');
                unityPlayerInstance.SendMessage('FBAPI', 'InterstitialPreloaded');
            })
            .catch(function (err) {
                console.error('Interstitial failed to preload: ' + err.message);
                unityPlayerInstance.SendMessage('FBAPI', 'InterstitialLoadError', JSON.stringify(err.message));
            });
    },

    FBShowInterstitial: function () {

        if (this.preloadedInterstitial == null) {
            unityPlayerInstance.SendMessage('FBAPI', 'InterstitialWatchError', "Preloaded is null");
            return;
        }

        this.preloadedInterstitial.showAsync()
            .then(function () {
                console.log('Interstitial ad finished successfully');
                unityPlayerInstance.SendMessage('FBAPI', 'InterstitialVideoWatched');
            })
            .catch(function (e) {
                console.error(e.message);
                unityPlayerInstance.SendMessage('FBAPI', 'InterstitialWatchError', JSON.stringify(e.message));
            });
    },

    FBCreateShortcutAsync: function () {
        FBInstant.canCreateShortcutAsync()
            .then(function (canCreateShortcut) {
                if (canCreateShortcut) {
                    FBInstant.createShortcutAsync()
                        .then(function () {
                            // Shortcut created
                        })
                        .catch(function () {
                            // Shortcut not created
                        });
                }
            });
    },

    FBUpdateAsync: function (buttonText, text, picture) {

        console.log("ContexType: " + FBInstant.context.get.getType());

        FBInstant.updateAsync({
            action: 'CUSTOM',
            cta: Pointer_stringify(buttonText),
            image: Pointer_stringify(picture),
            text: Pointer_stringify(text),
            template: 'first_place',
            data: {myReplayData: '...'},
            strategy: 'IMMEDIATE',
            notification: 'NO_PUSH',
        }).then(function () {
            // closes the game after the update is posted.
            //FBInstant.quit();
        });
    },

    FBGetData: function(dataKeys, bridgeName, successCallback) {
        var dataKeysStr = UTF8ToString(dataKeys);
        var bridgeNameStr = UTF8ToString(bridgeName);
        var successCallbackStr = UTF8ToString(successCallback);

        var keys = dataKeysStr.split(',');

        FBInstant.player.getDataAsync(keys)
            .then(function(data) {
                console.log('data is loaded');
                console.log(data);
                unityPlayerInstance.SendMessage(bridgeNameStr, successCallbackStr, JSON.stringify(data));
            });
    },

    FBSetData: function (data) {
        var dataStr = UTF8ToString(data);
        var dataObj = JSON.parse(dataStr);

        FBInstant.player.setDataAsync(dataObj)
            .then(FBInstant.player.flushDataAsync)
            .then(function() {
                console.log('Data saved ' + dataStr);
            });
    }
});