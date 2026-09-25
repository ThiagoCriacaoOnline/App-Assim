package com.m2br.assim.webview

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.MediaStore
import android.webkit.ValueCallback
import android.webkit.WebChromeClient.FileChooserParams
import android.webkit.WebView
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.reactnativecommunity.webview.RNCWebChromeClient
import com.reactnativecommunity.webview.RNCWebView
import com.reactnativecommunity.webview.RNCWebViewManager
import com.reactnativecommunity.webview.RNCWebViewWrapper

private const val PHOTO_PICKER_REQUEST_CODE = 51423

@ReactModule(name = CustomWebViewManager.REACT_CLASS)
class CustomWebViewManager : RNCWebViewManager() {

    companion object {
        const val REACT_CLASS = "RCTCustomWebView"
    }

    private var pendingCallback: ValueCallback<Array<Uri>>? = null

    inner class CustomWebChromeClient(webView: RNCWebView) : RNCWebChromeClient(webView) {

        override fun onShowFileChooser(
            webView: WebView,
            callback: ValueCallback<Array<Uri>>,
            params: FileChooserParams
        ): Boolean {
            val acceptTypes = params.acceptTypes ?: emptyArray()
            val wantsImage = acceptTypes.any { it.startsWith("image/") }
            val wantsVideo = acceptTypes.any { it.startsWith("video/") }

            if (wantsImage || wantsVideo) {
                val activity = (webView.context as? ThemedReactContext)?.currentActivity
                if (activity != null) {
                    pendingCallback = callback

                    val mimeType = when {
                        wantsImage && wantsVideo -> "*/*"
                        wantsVideo -> "video/*"
                        else -> "image/*"
                    }

                    val intent = Intent(MediaStore.ACTION_PICK_IMAGES).apply {
                        type = mimeType
                        if (params.mode == FileChooserParams.MODE_OPEN_MULTIPLE) {
                            putExtra(
                                MediaStore.EXTRA_PICK_IMAGES_MAX,
                                MediaStore.getPickImagesMaxLimit()
                            )
                        }
                    }

                    if (intent.resolveActivity(activity.packageManager) != null) {
                        activity.startActivityForResult(intent, PHOTO_PICKER_REQUEST_CODE)
                        return true
                    }
                    pendingCallback = null
                }
            }

            return super.onShowFileChooser(webView, callback, params)
        }
    }

    private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode != PHOTO_PICKER_REQUEST_CODE) return
            val callback = pendingCallback ?: return
            pendingCallback = null

            if (resultCode != Activity.RESULT_OK || data == null) {
                callback.onReceiveValue(arrayOf())
                return
            }

            val uris = mutableListOf<Uri>()
            val clipData = data.clipData
            if (clipData != null) {
                for (i in 0 until clipData.itemCount) {
                    uris.add(clipData.getItemAt(i).uri)
                }
            } else {
                data.data?.let { uris.add(it) }
            }

            callback.onReceiveValue(uris.toTypedArray())
        }
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNCWebViewWrapper {
        val rncWebView = RNCWebView(reactContext)
        val wrapper = super.createViewInstance(reactContext, rncWebView)
        rncWebView.webChromeClient = CustomWebChromeClient(rncWebView)
        reactContext.addActivityEventListener(activityEventListener)
        return wrapper
    }

    override fun getName(): String = REACT_CLASS
}