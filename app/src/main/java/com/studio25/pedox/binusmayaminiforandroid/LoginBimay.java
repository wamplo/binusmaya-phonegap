package com.studio25.pedox.binusmayaminiforandroid;

/**
 * Created by pedox on 12/15/14.
 */
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.app.Activity;
import android.util.Log;
import android.widget.Toast;

import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.RequestParams;
import com.loopj.android.http.TextHttpResponseHandler;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.http.Header;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

public class LoginBimay extends CordovaPlugin {

    Storage storage = new Storage();
    private static String bimay_url = "http://binusmaya.binus.ac.id";
    private static String bimay_api = "http://apps.binusmaya.binus.ac.id";

    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        final Activity context = this.cordova.getActivity();

        if("login".equals(action)) {
            this.login(context, true, args.getString(0), args.getString(1), callbackContext);
            return true;
        }
        if("loginAgain".equals(action)) {
            this.login(context, false, args.getString(0), args.getString(1), callbackContext);
            return true;
        }
        if("cekLogin".equals(action)) {
            this.cekLogin(context, callbackContext);
            return true;
        }
        if("cekJadwal".equals(action)) {
            this.cekJadwal(context, callbackContext);
            return true;
        }
        if("toast".equals(action)) {
            Toast.makeText(context, args.getString(0), Toast.LENGTH_LONG).show();
            return true;
        }
        return false;
    }

    public void login(final Activity context, final Boolean withAlert, final String binusid, final String password, final CallbackContext callbackContext)
    {
        final AsyncHttpClient client = new AsyncHttpClient();
        String token = storage.getData(context, "token");
        client.addHeader("Origin", "http://binusmaya.binus.ac.id");
        client.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2243.0 Safari/537.36");
        client.addHeader("Referer","http://binusmaya.binus.ac.id/Default.aspx");
        if(!token.equals("0")) {
            client.addHeader("Cookie", token);
        }

        final ProgressDialog progress = new ProgressDialog(context);
        if(withAlert) {
            progress.setTitle("Loading Binusmaya");
            progress.setMessage("Please wait hingga selesai ...");
            progress.show();
        }

        // Stage One
        client.get("http://binusmaya.binus.ac.id/Default.aspx", new TextHttpResponseHandler() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, String responseBody) {
                for (Header isi : headers) {
                    if (isi.getName().equals("Set-Cookie")) {
                        storage.setData(context, "token", isi.getValue());
                    }
                }
                //Get the Token
                Document html = Jsoup.parse(responseBody);
                String token  = html.select("#__VIEWSTATE").val();
                String validation  = html.select("#__EVENTVALIDATION").val();
                if(storage.getData(context, "tempLogin").equals("0")) {
                    login2(context, withAlert, binusid, password, token, validation, progress, callbackContext);
                } else {
                    Document name = Jsoup.parse(responseBody);
                    String fname = name.select("#content #topbar .right strong").text();
                    if(withAlert) {
                        Toast.makeText(context, "You are already logedin, so glad to see you " + fname, Toast.LENGTH_LONG).show();
                        progress.dismiss();
                    }
                }

            }

            @Override
            public void onFailure(int statusCode, Header[] headers, String responseBody, Throwable error) {
                if(withAlert) {
                    Toast.makeText(context, "Error : Cannot reach server", Toast.LENGTH_LONG).show();
                    progress.dismiss();
                }
                callbackContext.error(500);
            }
        });

        //on Cancel request
        if(withAlert) {
            progress.setCancelable(true);
            progress.setOnCancelListener(new DialogInterface.OnCancelListener() {
                @Override
                public void onCancel(DialogInterface dialog) {
                    client.cancelRequests(context, true);
                }
            });
        }

        //
    }

    public void login2(final Activity context, final Boolean withAlert, String binusid, String password, String h_token, String validation, final ProgressDialog progress, final CallbackContext callbackContext)
    {
        final AsyncHttpClient client = new AsyncHttpClient();
        String token = storage.getData(context, "token");

        client.addHeader("Origin", "http://binusmaya.binus.ac.id");
        client.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2243.0 Safari/537.36");
        client.addHeader("Referer","http://binusmaya.binus.ac.id/Default.aspx");
        client.addHeader("Cookie", token);

        RequestParams params = new RequestParams();
        params.put("__EVENTTARGET","");
        params.put("__EVENTARGUMENT", "");
        params.put("__VIEWSTATE", h_token);
        params.put("__EVENTVALIDATION", validation);
        params.put("txtUserId", binusid);
        params.put("txtPassword", password);
        params.put("txtWMark2_ClientState","");
        params.put("txtWMark1_ClientState","");
        params.put("btnLogin", "Log In");


        client.post("http://binusmaya.binus.ac.id/Default.aspx", params, new TextHttpResponseHandler() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, String responseBody) {
                Document error = Jsoup.parse(responseBody);
                if(error.select("#lblError").hasText()) {
                    if(withAlert) {
                        Toast.makeText(context, error.select("#lblError").html(), Toast.LENGTH_LONG).show();
                    }
                    callbackContext.error(501);
                } else {
                    if(withAlert) {
                        Toast.makeText(context, "Success Login", Toast.LENGTH_LONG).show();
                    }
                    Document name = Jsoup.parse(responseBody);
                    String fname = name.select("#content #topbar .right strong").text();
                    storage.setData(context, "tempLogin", "1");
                    callbackContext.success(fname);
                }
                progress.dismiss();
            }

            @Override
            public void onFailure(int statusCode, Header[] headers, String responseBody, Throwable error) {
                if(withAlert) {
                    Toast.makeText(context, "Error : Cannot reach server", Toast.LENGTH_LONG).show();
                    progress.dismiss();
                }
                callbackContext.error(500);

            }
        });

        //on Cancel request
        if(withAlert) {
            progress.setCancelable(true);
            progress.setOnCancelListener(new DialogInterface.OnCancelListener() {
                @Override
                public void onCancel(DialogInterface dialog) {
                    client.cancelRequests(context, true);
                }
            });
        }
    }

    private void getKoneksi(final Activity context, String url, TextHttpResponseHandler textHttpResponseHandler) {
        final AsyncHttpClient client = new AsyncHttpClient();
        String token = storage.getData(context, "token");

        client.addHeader("Origin", "http://binusmaya.binus.ac.id");
        client.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2243.0 Safari/537.36");
        client.addHeader("Referer","http://binusmaya.binus.ac.id/Default.aspx");
        client.addHeader("Cookie", token);

        client.get(url, textHttpResponseHandler);
    }

    private void postKoneksi(final Activity context, String url, RequestParams params, TextHttpResponseHandler textHttpResponseHandler) {
        final AsyncHttpClient client = new AsyncHttpClient();
        String token = storage.getData(context, "token");

        client.addHeader("Origin", "http://binusmaya.binus.ac.id");
        client.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2243.0 Safari/537.36");
        client.addHeader("Referer","http://binusmaya.binus.ac.id/Default.aspx");
        client.addHeader("Cookie", token);

        client.post(url, params, textHttpResponseHandler);
    }

    /**
     * Cek Jadwal
     * Ini adalah proses metamorfosa yang dapat membuat orang gulita melihat nya.
     * @param context
     * @param callbackContext
     */
    public void cekJadwal(final Activity context, final CallbackContext callbackContext) {
        Log.v("CekJadwal","Cek jadwal is started");
        this.getKoneksi(context, bimay_url, new TextHttpResponseHandler() {
            @Override
            public void onFailure(int statusCode, Header[] headers, String responseString, Throwable throwable) {
                Log.e("CekJadwal", "oopss ! :(");
                callbackContext.error(500);
            }

            @Override
            public void onSuccess(int statusCode, Header[] headers, String responseString) {
                //LOAD TO SCHEDULE PAGE
                Log.v("CekJadwal","Cek jadwal is logging to schedule page");
                Document url = Jsoup.parse(responseString);
                Elements urs = url.select(".itemContent").eq(0).select("ul li").eq(0).select("> a");
                String next_url = bimay_url + "/" + urs.attr("href");

                getKoneksi(context, next_url, new TextHttpResponseHandler() {
                    @Override
                    public void onFailure(int statusCode, Header[] headers, String responseString, Throwable throwable) {
                        Log.e("CekJadwal", "oopss ! :(");
                        callbackContext.error(500);
                    }

                    @Override
                    public void onSuccess(int statusCode, Header[] headers, String responseString) {
                        //Staging iframe
                        Log.v("CekJadwal","Cek jadwal is logging to iframe page");
                        Document url = Jsoup.parse(responseString);
                        String next_url = bimay_url + url.select("#ctl00_cp1_ifrApp").attr("src");
                        getKoneksi(context, next_url, new TextHttpResponseHandler() {
                            @Override
                            public void onFailure(int statusCode, Header[] headers, String responseString, Throwable throwable) {
                                Log.e("CekJadwal", "oopss ! :(");
                                callbackContext.error(500);
                            }

                            @Override
                            public void onSuccess(int statusCode, Header[] headers, String responseString) {
                                // I am Going to boorrrrreeed !!

                                Log.v("CekJadwal","Cek jadwal is logging to verry inner iframe page");
                                Document url = Jsoup.parse(responseString);
                                String next_url = url.select("#ifrApp").attr("src");
                                getKoneksi(context, next_url, new TextHttpResponseHandler() {
                                    @Override
                                    public void onFailure(int statusCode, Header[] headers, String responseString, Throwable throwable) {
                                        Log.e("CekJadwal", "oopss ! :(");
                                        callbackContext.error(500);
                                    }

                                    @Override
                                    public void onSuccess(int statusCode, Header[] headers, String responseString) {
                                        Log.v("CekJadwal","FINAALLY i've goot the miracle !");
                                        Document doc = Jsoup.parse(responseString);
                                        //let to check it now what happening in the middle of me ...
                                        final RequestParams params = new RequestParams();

                                        params.put("__EVENTTARGET", "ctl00$ContentPlaceHolder1$btnSchedule");
                                        params.put("__EVENTVALIDATION", doc.select("#__EVENTVALIDATION").val());
                                        params.put("__VIEWSTATE", doc.select("#__VIEWSTATE").val());
                                        params.put("__VIEWSTATEGENERATOR", doc.select("#__VIEWSTATEGENERATOR").val());
                                        params.put("__ctl00$ContentPlaceHolder1$ddlPeriod", doc.select("option[selected]").val());
                                        params.put("__LASTFOCUS" , "");
                                        params.put("__EVENTARGUMENT" , "");

                                        postKoneksi(context, bimay_api + "/LMS/" + doc.select("form").attr("action"), params, new TextHttpResponseHandler() {
                                            @Override
                                            public void onFailure(int statusCode, Header[] headers, String responseString, Throwable throwable) {
                                                Log.e("CekJadwal", "oopss ! :(");
                                                callbackContext.error(500);
                                            }

                                            @Override
                                            public void onSuccess(int statusCode, Header[] headers, String responseString) {
                                                Document jadwal = Jsoup.parse(responseString);
                                                Log.v("CekJadwal", "^_^ YEEEAAAAYyy !!!!");
                                                //callbackContext.success(jadwal.select("#ctl00_ContentPlaceHolder1_pnlGridView").html());
                                                callbackContext.success(responseString);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    public void cekLogin(final Activity context, final CallbackContext callbackContext)
    {
        String hasil = storage.getData(context, "tempLogin");
        if("1".equals(hasil)) {
            callbackContext.success(1);
        } else {
            callbackContext.success(0);
        }

    }
}
