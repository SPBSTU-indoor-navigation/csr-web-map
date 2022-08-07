/*! Copyright © 2015-2022 Apple Inc. All rights reserved. */
(() => {
  var t = {
    9353: (t, e, i) => {
      var n = i(9401),
        o = i(2114),
        s = i(8961),
        r = i(9602),
        a = i(7531),
        l = i(6246),
        h = {
          url: "https://cdn.apple-mapkit.com/ma/bootstrap",
          apiVersion: "2",
          accessKeyExpirationBiasMS: 3e4
        },
        c = {
          OK: 200,
          MULTIPLE_CHOICES: 300,
          BAD_REQUEST: 400,
          UNAUTHORIZED: 401,
          TOO_MANY_REQUESTS: 429
        },
        d = ["mkjsVersion", "messagePrefix", "poi"],
        u = ["language", "countryCode", "origin", "madabaBaseUrl", "authorizationCallback", "_showMapsLogo", "_mirrorLegalLink", "bootstrapTimeout", "_showsTileInfo", "_distUrl", "_syrupUrl"],
        p = {
          READY: 0,
          PENDING: 1,
          ERROR: 2,
          UNINITIALIZED: 3
        },
        m = "Initialized",
        g = "Refreshed",
        _ = {
          BadRequest: "Bad Request",
          Unauthorized: "Unauthorized",
          TooManyRequests: "Too Many Requests",
          Timeout: "Timeout"
        },
        f = "Bearer {{token}}",
        y = "Apple",
        v = "AutoNavi",
        w = Math.random().toString(36);

      function b() { }
      b.prototype = o.inheritPrototype(s.EventTarget, b, {
        HTTP: c,
        ErrorStatus: _,
        Events: {
          Initialized: "configuration-init",
          Changed: "configuration-change",
          Error: "error"
        },
        States: p,
        state: p.UNINITIALIZED,
        authorizationCallback: null,
        tileProvider: y,
        _countryCode: null,
        _showMapsLogo: !0,
        _mirrorLegalLink: !1,
        _madabaBaseUrl: null,
        customMadabaUrl: !1,
        _madabaDomains: null,
        _accessKey: null,
        _accessToken: null,
        _distUrl: null,
        _syrupUrl: null,
        apiBaseUrl: null,
        apiBaseUrlOverride: null,
        types: {},
        _acceptLanguage: null,
        _optionsLanguage: null,
        _bootstrapRequestParams: null,
        _showsTileInfo: !1,
        _messagePrefix: "[MapKit] ",
        withParameters: function (t) {
          return d.forEach((function (e) {
            e in t && (this["_" + e] = t[e])
          }), this), this
        },
        init: function (t, e) {
          if (o.required(t, e + "`options` object is required.", {
            checkNull: !0
          }).checkType(t, "object", e + "`options` object is invalid."), Object.keys(t).forEach((function (t) {
            -1 === u.indexOf(t) && console.warn(e + "ignoring invalid option: `" + t + "`.")
          })), null === this.authorizationCallback) {
            this.state = p.PENDING;
            var i = t.authorizationCallback;
            o.required(i, e + "`options` is missing `authorizationCallback`.", {
              checkNull: !0
            }).checkType(i, "function", e + "`authorizationCallback` in `options` must be a function."), this.authorizationCallback = i, t.language && (o.checkType(t.language, "string", e + "`language` in `options` must be a string."), this._optionsLanguage = t.language), o.isNode() && t.origin && (this.origin = t.origin), this.language ? this._l10n && (this._l10n.localeId = this.language) : this.language = this._optionsLanguage, "countryCode" in t && (this._countryCode = t.countryCode), "_showMapsLogo" in t && (this._showMapsLogo = !!t._showMapsLogo), "_mirrorLegalLink" in t && (this._mirrorLegalLink = !!t._mirrorLegalLink), t.bootstrapTimeout && (this._bootstrapTimeout = t.bootstrapTimeout), t.madabaBaseUrl && (this._madabaBaseUrl = t.madabaBaseUrl, this.customMadabaUrl = !0), t._showsTileInfo && (this._showsTileInfo = t._showsTileInfo), this._loadFromServer()
          } else console.warn(e + "already initialized; ignoring.")
        },
        reloadFromServer: function () {
          this._loadFromServer()
        },
        get accessKey() {
          return this._accessKey
        },
        get accessToken() {
          return this._accessToken
        },
        accessKeyHasExpired: function () {
          this._loadFromServer(a.Highest)
        },
        get ready() {
          return this.state === p.READY
        },
        get error() {
          return this.state === p.ERROR
        },
        get language() {
          return this._language
        },
        set language(t) {
          t !== this._language && (t ? o.checkType(t, "string", "[MapKit] `language` must be a string or `null`.") : t = this._acceptLanguage || this._getClientLanguage(), this._language = n.bestMatch(t, "en"), this.state !== p.UNINITIALIZED && this._l10n && (this._l10n.localeId = t))
        },
        get countryCode() {
          return this._countryCode
        },
        set countryCode(t) {
          t !== this._countryCode && (t && (o.checkType(t, "string", "[MapKit] `countryCode` must be a string or `null`."), t = t.toUpperCase()), this._countryCode = t, this._loadFromServer())
        },
        get showMapsLogo() {
          return this._showMapsLogo
        },
        get mirrorLegalLink() {
          return this._mirrorLegalLink
        },
        get isAutoNavi() {
          return this.tileProvider === v || this.state === p.PENDING && "CN" === this._countryCode
        },
        get showsTileInfo() {
          return this._showsTileInfo
        },
        syrupRequestedFallback: function (t) {
          this._syrupRequestedFallback = !0, this._syrupRequestedFallbackType = t, setTimeout(function () {
            var t = new s.Event(this.Events.Changed);
            t.status = g, this.dispatchEvent(t)
          }.bind(this), 0)
        },
        get canRunCSR() {
          var t = "CLIENT" === this.forcedRenderingMode || "HYBRID" === this.forcedRenderingMode,
            e = "SERVER" === this.forcedRenderingMode;
          return !(!this.ready || e || this._disableCsr && !t || this._syrupRequestedFallback)
        },
        get madabaDomains() {
          return this.customMadabaUrl || !this._madabaDomains && this._madabaBaseUrl ? [this._madabaBaseUrl] : this._madabaDomains ? this._madabaDomains : null
        },
        appendAuthOptions: function (t, e) {
          return this.origin && (t.origin = this.origin), this.authorizationCallback && (t.headers = {
            Authorization: o.fillTemplate(f, {
              token: e || this.accessToken
            })
          }), t
        },
        appendServiceAuthOptions: function (t) {
          return t.withCredentials = this.withCredentials, this.isAutoNavi ? t : this.appendAuthOptions(t)
        },
        setL10n: function (t) {
          this._l10n = t, this.state !== p.UNINITIALIZED && (this._l10n.localeId = this.language)
        },
        loaderWillStart: function (t) {
          this.state = p.PENDING
        },
        loaderDidSucceed: function (t, e) {
          this._requestDidLoad(e)
        },
        loaderDidFail: function (t, e) {
          this._parseError(t._xhr)
        },
        _loadFromServer: function (t) {
          this._bootstrapRequestParams = {
            apiVersion: h.apiVersion,
            countryCode: this._countryCode,
            mkjsVersion: this._mkjsVersion,
            poi: this._poi
          };
          var e = h.url + "?" + o.toQueryString(this._bootstrapRequestParams);
          this.proxyPrefixes && (e = this.proxyPrefixes[0] + e);
          var i = {
            retry: !0,
            delay: 0,
            priority: t,
            timeout: this._bootstrapTimeout,
            withCredentials: this.withCredentials
          };
          !o.isNode() && this.withCredentials && /\bapple\.com\b/.test(this.proxyPrefixes[0]) && !/\bapple\.com$/.test(window.location.hostname) && console.warn("[MapKit] Request with credentials may fail if the page is not hosted on the same domain as the proxy."), l(this.authorizationCallback, null, [function (t) {
            ! function (t) {
              if (t !== w) {
                w = t;
                var e = "[MapKit] Authorization token is invalid.";
                if ("string" == typeof t) {
                  var i = t.split(".");
                  if (3 === i.length) {
                    try {
                      i.pop(), i = i.map((function (t) {
                        return JSON.parse(o.atob(t))
                      }))
                    } catch (t) {
                      return void console.warn(e)
                    }
                    "alg" in i[0] ? "ES256" !== i[0].alg && console.warn('[MapKit] Authorization token has incorrect "alg" value.') : console.warn('[MapKit] Authorization token has no "alg" value.'), "typ" in i[0] ? "JWT" !== i[0].typ && console.warn('[MapKit] Authorization token has incorrect "typ" value.') : console.warn('[MapKit] Authorization token has no "typ" value.'), "kid" in i[0] || console.warn('[MapKit] Authorization token has no "kid" value.');
                    var n = Date.now(),
                      s = 1e3 * parseInt(i[1].iat);
                    if (!("iat" in i[1]) || isNaN(s) ? console.warn('[MapKit] Authorization token has no "iat" value.') : s > n + 36e5 && console.warn('[MapKit] Authorization token may have an "iat" value that is in the future (' + new Date(s) + ")."), "exp" in i[1]) {
                      var r = 1e3 * parseInt(i[1].exp);
                      r < n || isNaN(r) ? console.warn('[MapKit] Authorization token may be expired according to its "exp" value.') : r > n + 31536e6 && console.warn("[MapKit] Authorization token with expiration date greater than 1 year is not recommended in production environments.")
                    } else isNaN(s) || console.warn("[MapKit] Authorization token (created on " + new Date(s) + ") without an expiration is not recommended in production environments.");
                    o.isNode() || "origin" in i[1] || console.warn("[MapKit] Authorization token without origin restriction is not recommended in production environments.")
                  } else console.warn(e)
                } else console.warn(e)
              }
            }(t), this.appendAuthOptions(i, t), this.accessToken && (i.headers["X-Maps-Access-Token"] = o.fillTemplate(f, {
              token: this.accessToken
            })), new r(e, this, i).schedule()
          }.bind(this)])
        },
        _requestDidLoad: function (t) {
          if (!this._parseError(t)) try {
            var e = JSON.parse(t.responseText);
            this._processLoadedData(e)
          } catch (t) {
            console.error(this._messagePrefix + "Initialization failed because of incorrect server response."), this._loadFailed()
          }
        },
        _resetReloadTimer: function (t) {
          clearTimeout(this._reloadTimerId), this._reloadTimerId = setTimeout(function () {
            delete this._reloadTimerId, this.accessKeyHasExpired()
          }.bind(this), t), o.isNode() && this._reloadTimerId.unref()
        },
        _loadSucceeded: function (t) {
          setTimeout(function () {
            this.state = p.READY;
            var e = new s.Event(this.Events.Changed);
            e.status = t ? g : m, this.dispatchEvent(e)
          }.bind(this), 0)
        },
        _loadFailed: function (t) {
          setTimeout(function () {
            this.state = p.ERROR;
            var e = new s.Event(this.Events.Error);
            e.status = t, this.dispatchEvent(e)
          }.bind(this), 0)
        },
        _processLoadedData: function (t) {
          var e = !!this._accessToken;
          this._parseData(t), this.expiresInSeconds && this._resetReloadTimer(this._adjustedExpirationInSeconds(this.expiresInSeconds)), this.language || (this.language = this._optionsLanguage), this._loadSucceeded(e)
        },
        _parseData: function (t) {
          var e;
          if (t.apiBaseUrl, this._countryCode = "unknown" !== t.countryCode ? t.countryCode : null, this.environment = t.environment, this.apiBaseUrl = this.apiBaseUrlOverride || t.apiBaseUrl, this.proxyPrefixes && (e = this.proxyPrefixes[this.proxyPrefixes.length - 1], this.apiBaseUrl = e + this.apiBaseUrl), t.analytics) {
            var i = t.analytics;
            this.proxyPrefixes && (i.analyticsUrl = e + i.analyticsUrl, i.errorUrl = e + i.errorUrl), this.analytics = i
          }
          t.authInfo && t.authInfo.team_id && (this.teamId = t.authInfo.team_id), t.locationShiftUrl && (this.proxyPrefixes ? this.locationShiftUrl = e + t.locationShiftUrl : this.locationShiftUrl = t.locationShiftUrl), this.expiresInSeconds = t.expiresInSeconds, this.customMadabaUrl || !t.madabaBaseUrl && !t.madabaDomains || (this._madabaBaseUrl = t.madabaBaseUrl, this._madabaDomains = t.madabaDomains && t.madabaDomains.length && t.madabaDomains.map(function (t) {
            return t.match(/^(https?:)?\/\//) ? t : -1 !== t.indexOf(":") && this.proxyPrefixes ? "http://" + t : "https://" + t
          }.bind(this))), this._disableCsr = !!t.disableCsr, t.accessKey && (this._accessKey = t.accessKey), t.authInfo && t.authInfo.access_token && (this._accessToken = t.authInfo.access_token), this._acceptLanguage = this._parseAcceptLanguage(t.acceptLanguage), this.tileProvider = y;
          var n = {};
          t.attributions && t.attributions.forEach((function (t) {
            n[t.attributionId] = t, this.tileGroup = t.attributionId
          }), this);
          var o = {};
          for (var s in t.tileSources.forEach(function (t) {
            var e = t.tileSource;
            o[e] = {
              name: e,
              path: t.path,
              domains: t.domains,
              proxyPrefixes: this.proxyPrefixes,
              withCredentials: this.withCredentials,
              crossOrigin: !0,
              protocol: t.protocol || (this.proxyPrefixes && -1 !== t.domains[0].indexOf(":") ? "http:" : "https:"),
              attribution: n[t.attributionId],
              minZoomLevel: t.minZoomLevel,
              maxZoomLevel: t.maxZoomLevel,
              supportedSizes: t.supportedSizes,
              supportedResolutions: t.supportedResolutions,
              showPrivacyLink: t.showPrivacyLink,
              showTermsOfUseLink: t.showTermsOfUseLink
            }, t.needsLocationShift && (this.tileProvider = v), o[e].attribution && o[e].attribution.global && (o[e].attribution.name = o[e].attribution.global[0].name, o[e].attribution.url = o[e].attribution.global[0].url)
          }.bind(this)), this.types = {}, this.rasterTilesForSyrup = {}, t.modes) {
            var r = t.modes[s].layers;
            this.types[s] = {
              name: s,
              provider: this.tileProvider,
              lowResolutionTileSource: o[r[0].lowResTileSource],
              tileSources: r.map((function (t) {
                return o[t.tileSource]
              }))
            }, this.rasterTilesForSyrup[s] = {
              name: s,
              provider: this.tileProvider,
              tileSources: r.map((function (t) {
                return o[t.tileSource]
              }))
            }
          }
        },
        _parseError: function (t) {
          var e, i, n = t.status;
          if (n >= c.OK && n < c.MULTIPLE_CHOICES) return !1;
          if (t.readyState !== t.DONE) i = _.Timeout, e = "Initialization failed because the request timed out after " + this._bootstrapTimeout + " ms.";
          else if (n === c.UNAUTHORIZED) {
            i = _.Unauthorized, e = "Initialization failed because the authorization token is invalid.";
            try {
              var o = JSON.parse(t.responseText);
              o.error && o.error.details && Array.isArray(o.error.details) && o.error.details.forEach((function (t) {
                t && "ORIGIN_CHECK_FAILURE" === t.errorType && t.message && (e += " " + t.message)
              }))
            } catch (t) {
              if ("SyntaxError" !== t.name) throw t
            }
          } else n === c.TOO_MANY_REQUESTS ? (i = _.TooManyRequests, e = "Initialization failed because the daily usage limit has exceeded.") : e = "Initialization failed because the server returned error " + n + " (" + t.statusText + ").";
          return console.error(this._messagePrefix + e), this._loadFailed(i), !0
        },
        _getClientLanguage: function () {
          return o.isNode() ? "en-US" : window.navigator.languages ? window.navigator.languages[0] : window.navigator.language
        },
        _parseAcceptLanguage: function (t) {
          var e = n.constructor.parseAcceptLanguage(t);
          return e && e[0].langTag ? e[0].langTag.tag : null
        },
        _adjustedExpirationInSeconds: function (t) {
          return 1e3 * t - h.accessKeyExpirationBiasMS
        },
        _restore: function () {
          delete this._proxyPrefixes, delete this._forcedRenderingMode, delete this._distUrl, this.authorizationCallback = null, this._acceptLanguage = null, this._optionsLanguage = null, delete this._language, this.apiBaseUrl = null, this.apiBaseUrlOverride = null, this.state = p.UNINITIALIZED, this._listeners = {}, clearTimeout(this._reloadTimerId), delete this._reloadTimerId
        },
        _debugInfo: function () {
          var t = {};
          return ["ready", "state", "_countryCode", "tileProvider", "apiBaseUrl", "language", "_acceptLanguage", "_optionsLanguage", "_getClientLanguage", "types"].forEach((function (e) {
            t[e] = "function" == typeof this[e] ? this[e]() : this[e]
          }), this), t
        }
      }), o.isNode() && (b.prototype.MapsWS = h), t.exports = b
    },
    2589: t => {
      t.exports = function (t, e, i) {
        var n;
        return function () {
          var o = arguments;

          function s() {
            n = null, t.apply(i, o)
          }
          n && window.clearTimeout(n), n = window.setTimeout(s, e || 0)
        }
      }
    },
    9601: (t, e, i) => {
      var n = i(2114),
        o = i(1636),
        s = Math.PI / 180,
        r = Math.PI / 4,
        a = 2 * Math.PI,
        l = 12;

      function h(t) {
        var e = n.clamp(t, 1e-8 - 90, 90 - 1e-8) * s;
        return .5 + Math.log(Math.tan(r - e / 2)) / a
      }

      function c(t) {
        var e = Math.pow(Math.E, 2 * Math.PI * (t - .5));
        return -2 * (Math.atan(e) - Math.PI / 4) / Math.PI * 180
      }

      function d(t) {
        return n.mod(t / 360 + .5, 1)
      }

      function u(t) {
        return 360 * (n.mod(t, 1) - .5)
      }

      function p(t) {
        return n.mod(180 + t, 360) - 180
      }
      var m = 1e-8,
        g = c(0),
        _ = c(1);

      function f(t, e) {
        var i, n, o, r, a = t.toCoordinate(),
          l = e.toCoordinate();
        return i = a.latitude, n = a.longitude, o = l.latitude, r = l.longitude,
          function (t, e, i, n, o) {
            var r = (i - t) * s,
              a = (n - e) * s,
              l = Math.pow(Math.sin(r / 2), 2) + Math.cos(t * s) * Math.cos(i * s) * Math.pow(Math.sin(a / 2), 2),
              h = 2 * Math.atan2(Math.sqrt(l), Math.sqrt(1 - l));
            return o * h
          }(i, n, o, r, 6378160 - 21e3 * Math.sin(i * s))
      }

      function y(t, e) {
        o(this, y) && (void 0 === t && (t = new w), void 0 === e && (e = new v), n.checkInstance(t, w, "[MapKit] `center` is not a Coordinate."), n.checkInstance(e, v, "[MapKit] `span` is not a CoordinateSpan."), this.center = new w(t.latitude, t.longitude), this.span = new v(e.latitudeDelta, e.longitudeDelta))
      }

      function v(t, e) {
        o(this, v) && (void 0 === t && (t = 0), void 0 === e && (e = 0), n.checkType(t, "number", "[MapKit] `latitudeDelta` is not a number."), n.checkType(e, "number", "[MapKit] `longitudeDelta` is not a number."), this.latitudeDelta = Math.max(t, 0), this.longitudeDelta = Math.max(e, 0))
      }

      function w(t, e) {
        o(this, w) && (void 0 === t && (t = 0), void 0 === e && (e = 0), n.checkType(t, "number", "[MapKit] `latitude` is not a number."), n.checkType(e, "number", "[MapKit] `longitude` is not a number."), this.latitude = t, this.longitude = e)
      }

      function b(t, e, i, s) {
        o(this, b) && (arguments.length < 4 && (s = 0, arguments.length < 3 && (i = 0, arguments.length < 2 && (e = 0, arguments.length < 1 && (t = 0)))), n.checkType(t, "number", "[MapKit] Expected a number for `northLatitude` in BoundingRegion constructor but got `" + t + "` instead."), n.checkType(e, "number", "[MapKit] Expected a number for `eastLongitude` in BoundingRegion constructor but got `" + e + "` instead."), n.checkType(i, "number", "[MapKit] Expected a number for `southLatitude` in BoundingRegion constructor but got `" + i + "` instead."), n.checkType(s, "number", "[MapKit] Expected a number for `westLongitude` in BoundingRegion constructor but got `" + s + "` instead."), this.northLatitude = t, this.eastLongitude = e, this.southLatitude = i, this.westLongitude = s)
      }

      function C(t, e) {
        o(this, C) && (arguments.length < 2 && (e = 0, arguments.length < 1 && (t = 0)), n.checkType(t, "number", "[MapKit] Expected a number for `x` in MapPoint constructor but got `" + t + "` instead."), n.checkType(e, "number", "[MapKit] Expected a number for `y` in MapPoint constructor but got `" + e + "` instead."), this.x = t, this.y = e)
      }

      function k(t, e) {
        o(this, k) && (arguments.length < 2 && (e = 0, arguments.length < 1 && (t = 0)), n.checkType(t, "number", "[MapKit] Expected a number for `width` in MapSize constructor but got `" + t + "` instead."), n.checkType(e, "number", "[MapKit] Expected a number for `height` in MapSize constructor but got `" + e + "` instead."), this.width = t, this.height = e)
      }

      function S(t, e, i, s) {
        o(this, S) && (arguments.length < 4 && (s = 0, arguments.length < 3 && (i = 0, arguments.length < 2 && (e = 0, arguments.length < 1 && (t = 0)))), n.checkType(t, "number", "[MapKit] Expected a number for `x` in MapRect constructor but got `" + t + "` instead."), n.checkType(e, "number", "[MapKit] Expected a number for `y` in MapRect constructor but got `" + e + "` instead."), n.checkType(i, "number", "[MapKit] Expected a number for `width` in MapRect constructor but got `" + i + "` instead."), n.checkType(s, "number", "[MapKit] Expected a number for `height` in MapRect constructor but got `" + s + "` instead."), this.origin = new C(t, e), this.size = new k(i, s))
      }

      function M(t, e) {
        if (o(this, M)) {
          if (null == e)
            if ("number" == typeof t) e = 1 / 0;
            else {
              var i = null == t ? {} : t,
                n = Object.prototype.hasOwnProperty;
              t = n.call(i, "minCameraDistance") ? i.minCameraDistance : 0, e = n.call(i, "maxCameraDistance") ? i.maxCameraDistance : 1 / 0
            } if ("number" != typeof t || t < 0) throw new Error("[MapKit] The `minCameraDistance` property of CameraZoomRange must be a number >= 0");
          if ("number" != typeof e || e < 0) throw new Error("[MapKit] The `maxCameraDistance` property of CameraZoomRange must be a number >= 0");
          if (e < t) throw new Error("[MapKit] The `maxCameraDistance` property of CameraZoomRange must be greater than the `minCameraDistance` property.");
          this._minCameraDistance = t, this._maxCameraDistance = e
        }
      }
      y.prototype = {
        constructor: y,
        copy: function () {
          return new y(this.center.copy(), this.span.copy())
        },
        toString: function () {
          return ["CoordinateRegion(", "\tlatitude: " + this.center.latitude, "\tlongitude: " + this.center.longitude, "\tlatitudeDelta: " + this.span.latitudeDelta, "\tlongitudeDelta: " + this.span.longitudeDelta, ")"].join("\n")
        },
        equals: function (t) {
          return this.center.equals(t.center) && this.span.equals(t.span)
        },
        toBoundingRegion: function () {
          var t = this.span.latitudeDelta / 2,
            e = this.span.longitudeDelta / 2;
          return new b(this.center.latitude + t, p(this.center.longitude + e), this.center.latitude - t, p(this.center.longitude - e))
        },
        toMapRect: function () {
          if (this.span.latitudeDelta < 0) this.span.latitudeDelta = 0;
          else {
            var t = h(Math.abs(this.center.latitude)),
              e = g - c(2 * t);
            this.span.latitudeDelta > e && (this.span.latitudeDelta = e)
          }
          var i = p(this.center.longitude),
            n = this.span.longitudeDelta / 2,
            o = i - n,
            s = i + n,
            r = !1;
          o < -180 && (o += 360, r = !0);
          var a = !1;
          s > 180 && (s -= 360, a = !0);
          var l = new w(this.center.latitude, o),
            d = new w(this.center.latitude, s),
            u = l.toMapPoint(),
            f = d.toMapPoint();
          r && (u.x -= 1), a && (f.x += 1);
          var y = new S;
          if (0 === this.center.latitude) {
            var v = new w(this.center.latitude + this.span.latitudeDelta / 2, this.center.longitude),
              b = new w(this.center.latitude - this.span.latitudeDelta / 2, this.center.longitude);
            return y.origin.x = u.x, y.size.width = f.x - y.origin.x, y.origin.y = v.toMapPoint().y, y.size.height = b.toMapPoint().y - y.origin.y, y
          }
          var k = this.copy();
          k.center.latitude = _ + this.span.latitudeDelta / 2;
          var M = 10,
            E = new w,
            L = new C;
          v = new w, b = new w, v.longitude = this.center.longitude, b.longitude = this.center.longitude;
          var T = 0;
          do {
            if (k.center.latitude > g && k.center.latitude > this.center.latitude || k.center.latitude < _ && k.center.latitude < this.center.latitude) k.center.latitude -= M, M *= .1;
            else if (k.center.latitude > g || k.center.latitude < _) return new S(0, 0, 1, 1);
            if (T > 500) return new S(0, 0, 1, 1);
            v.latitude = k.center.latitude + k.span.latitudeDelta / 2, b.latitude = k.center.latitude - k.span.latitudeDelta / 2, y.origin.x = u.x, y.size.width = f.x - y.origin.x, y.origin.y = v.toMapPoint().y, y.size.height = b.toMapPoint().y - y.origin.y, L.x = y.midX(), L.y = y.midY(), E = L.toCoordinate(), (M > 0 && E.latitude > this.center.latitude || M < 0 && E.latitude < this.center.latitude) && (M *= -.1), k.center.latitude += M, T++
          } while (Math.abs(E.latitude - this.center.latitude) >= m);
          return y
        },
        get radius() {
          var t, e, i = this.toMapRect();
          return i.size.width > i.size.height ? (t = new C(i.minX(), i.midY()), e = new C(i.maxX(), i.midY())) : (t = new C(i.midX(), i.minY()), e = new C(i.midX(), i.maxY())), f(t, e) / 2
        }
      }, v.prototype = {
        constructor: v,
        copy: function () {
          return new v(this.latitudeDelta, this.longitudeDelta)
        },
        equals: function (t) {
          return Math.abs(this.latitudeDelta - t.latitudeDelta) < m && Math.abs(this.longitudeDelta - t.longitudeDelta) < m
        },
        toString: function () {
          return ["CoordinateSpan(", "\tlatitudeDelta: " + this.latitudeDelta, "\tlongitudeDelta: " + this.longitudeDelta, ")"].join("\n")
        }
      }, w.prototype = {
        constructor: w,
        copy: function () {
          return new w(this.latitude, this.longitude)
        },
        equals: function (t) {
          return Math.abs(this.latitude - t.latitude) < m && Math.abs(this.longitude - t.longitude) < m
        },
        toMapPoint: function () {
          return new C(d(this.longitude), h(this.latitude))
        },
        toUnwrappedMapPoint: function () {
          return new C(this.longitude / 360 + .5, h(this.latitude))
        },
        toString: function () {
          return ["Coordinate(", "latitude:" + this.latitude.toFixed(l), ",longitude:" + this.longitude.toFixed(l), ")"].join("")
        }
      }, b.prototype = {
        constructor: b,
        copy: function () {
          return new b(this.northLatitude, this.eastLongitude, this.southLatitude, this.westLongitude)
        },
        toString: function () {
          return ["BoundingRegion(", "\tnorthLatitude: " + this.northLatitude, "\teastLongitude: " + this.eastLongitude, "\tsouthLatitude: " + this.southLatitude, "\twestLongitude: " + this.westLongitude, ")"].join("\n")
        },
        toCoordinateRegion: function () {
          var t = p(this.eastLongitude),
            e = p(this.westLongitude);
          t < e && (t += 360);
          var i = this.northLatitude - this.southLatitude,
            n = t - e;
          return new y(new w(this.southLatitude + i / 2, p(e + n / 2)), new v(i, n))
        }
      }, C.prototype = {
        constructor: C,
        z: 0,
        w: 1,
        toString: function () {
          return "MapPoint(" + this.x + ", " + this.y + ")"
        },
        copy: function () {
          return new C(this.x, this.y)
        },
        equals: function (t) {
          return this.x === t.x && this.y === t.y
        },
        toCoordinate: function () {
          return new w(c(this.y), p(u(this.x)))
        }
      }, k.prototype = {
        constructor: k,
        toString: function () {
          return "MapSize(" + this.width + ", " + this.height + ")"
        },
        copy: function () {
          return new k(this.width, this.height)
        },
        equals: function (t) {
          return this.width === t.width && this.height === t.height
        }
      }, S.prototype = {
        constructor: S,
        toString: function () {
          return "MapRect(" + [this.origin.x.toFixed(l), this.origin.y.toFixed(l), this.size.width.toFixed(l), this.size.height.toFixed(l)].join(", ") + ")"
        },
        copy: function () {
          return new S(this.origin.x, this.origin.y, this.size.width, this.size.height)
        },
        equals: function (t) {
          return this.origin.equals(t.origin) && this.size.equals(t.size)
        },
        minX: function () {
          return this.origin.x
        },
        minY: function () {
          return this.origin.y
        },
        midX: function () {
          return this.origin.x + this.size.width / 2
        },
        midY: function () {
          return this.origin.y + this.size.height / 2
        },
        maxX: function () {
          return this.origin.x + this.size.width
        },
        maxY: function () {
          return this.origin.y + this.size.height
        },
        scale: function (t, e) {
          if (n.required(t, "[MapKit] Missing `scaleFactor` parameter in call to `MapRect.scale()`."), "number" != typeof t || isNaN(t)) throw new TypeError("[MapKit] The `scaleFactor` parameter passed to `MapRect.scale()` is not a number.");
          var i = this.size.width * t,
            o = this.size.height * t;
          return e ? (n.checkInstance(e, C, "[MapKit] The `scaleCenter` parameter passed to `MapRect.scale()` is not a MapPoint."), new S(e.x - t * (e.x - this.origin.x), e.y - t * (e.y - this.origin.y), i, o)) : new S(this.midX() - i / 2, this.midY() - o / 2, i, o)
        },
        toCoordinateRegion: function () {
          var t = this.origin.toCoordinate(),
            e = new C(this.maxX(), this.maxY()).toCoordinate(),
            i = Math.abs(e.latitude - t.latitude),
            n = e.longitude - t.longitude;
          return e.longitude < t.longitude && (n += 360), new y(new C(this.midX(), this.midY()).toCoordinate(), new v(i, n))
        }
      }, M.prototype = {
        get minCameraDistance() {
          return this._minCameraDistance
        },
        get maxCameraDistance() {
          return this._maxCameraDistance
        },
        copy: function () {
          return new M(this._minCameraDistance, this._maxCameraDistance)
        }
      }, t.exports = {
        tileSize: 256,
        convertLatitudeToY: h,
        convertYToLatitude: c,
        convertLongitudeToX: d,
        convertXToLongitude: u,
        wrapLongitude: p,
        wrapX: function (t, e) {
          for (var i, n = 1.5, o = -1; o <= 1; ++o) {
            var s = Math.abs(t + o - e);
            s < n && (n = s, i = t + o)
          }
          return i
        },
        zoomLevelForMapRectInViewport: function (t, e, i) {
          var o = e.width / (i * t.size.width),
            s = e.height / (i * t.size.height);
          return n.log2(Math.min(o, s))
        },
        mapUnitsPerMeterAtLatitude: function (t) {
          var e = t * s,
            i = 111132.92 + -559.82 * Math.cos(2 * e) + 1.175 * Math.cos(4 * e) + -.0023 * Math.cos(6 * e),
            n = h(t - .5),
            o = h(t + .5);
          return Math.abs(n - o) / i
        },
        pointsPerAxis: function (t) {
          return 256 * Math.pow(2, t)
        },
        CameraZoomRange: M,
        CoordinateRegion: y,
        CoordinateSpan: v,
        Coordinate: w,
        BoundingRegion: b,
        MapPoint: C,
        MapRect: S,
        MapSize: k
      }
    },
    7418: t => {
      "use strict";
      t.exports = {
        Feature: "Feature",
        FeatureCollection: "FeatureCollection",
        GeometryCollection: "GeometryCollection",
        MultiPoint: "MultiPoint",
        MultiLineString: "MultiLineString",
        MultiPolygon: "MultiPolygon",
        Point: "Point",
        LineString: "LineString",
        Polygon: "Polygon",
        Position: "Position"
      }
    },
    1472: (t, e, i) => {
      "use strict";
      var n = i(8079),
        o = i(9601).Coordinate,
        s = i(8157),
        r = i(7418),
        a = i(6246),
        l = i(4937),
        h = {
          Point: i(9389),
          LineString: i(9944),
          Polygon: i(6459)
        },
        c = {
          MultiPoint: r.Point,
          MultiLineString: r.LineString,
          MultiPolygon: r.Polygon
        },
        d = [r.MultiPoint, r.MultiLineString, r.MultiPolygon];

      function u(t) {
        this.message = t
      }

      function p(t, e, i) {
        var n = function () {
          var e = i(n.collection ? n.collection.items[n.index] : t.scheduledTaskItem);
          n.collection ? n.collection.items[n.index] = e : t.scheduledTaskItem = e
        };
        return e && (n.collection = e, n.index = e.items.length), l.scheduleInBackground(n, l.Priority.Highest), n
      }

      function m(t) {
        if (!s.isPosition(t)) throw new u("[MapKit] Expected a GeoJSON Position type, instead got " + t);
        return new o(t[1], t[0])
      }

      function g(t, e, i) {
        var o, s = d.indexOf(t.type) > -1,
          l = "GeometryCollection" === t.type;
        if (s || l) {
          var _ = s ? t.coordinates : t.geometries;
          if (s) switch (t.type) {
            case r.MultiPoint:
              o = e.delegate.itemForMultiPoint;
              break;
            case r.MultiLineString:
              o = e.delegate.itemForMultiLineString;
              break;
            case r.MultiPolygon:
              o = e.delegate.itemForMultiPolygon
          }
          l && (o = e.delegate.itemForPoint);
          var f = new n([], t);
          return _.forEach((function (i) {
            s && (i = {
              type: c[t.type],
              coordinates: i
            }), f.items.push(g(i, e, f))
          })), e.hasCallbackOrDelegate && p(e, i, (function () {
            return f._impl.items = f.items.filter((function (t) {
              return !!t
            })), o ? a(o, e.delegate, [f, t], f) : f
          })), f
        }
        var y = h[t.type];
        if (!y) throw new u("[MapKit] Expected a GeoJSON " + t.type + " type, instead got " + t);
        var v, w, b = function (t, e) {
          switch (e) {
            case r.MultiPoint:
            case r.LineString:
              return t.map((function (t) {
                return m(t)
              }));
            case r.Polygon:
              return t.map((function (t) {
                return t.map((function (t) {
                  return m(t)
                }))
              }));
            default:
              return m(t)
          }
        }(t.coordinates, t.type);
        switch (t.type) {
          case r.Point:
            o = e.delegate.itemForPoint, v = b;
            break;
          case r.LineString:
            o = e.delegate.itemForLineString, w = e.delegate.styleForOverlay;
            break;
          case r.Polygon:
            o = e.delegate.itemForPolygon, w = e.delegate.styleForOverlay
        }

        function C() {
          var i = new y(b, {
            data: t
          }),
            n = o ? a(o, e.delegate, [v || i, t], i) : i;
          return n ? (++e.itemCount, w && (n.style = a(w, e.delegate, [i, t], i)), n) : null
        }
        return e.hasCallbackOrDelegate ? p(e, i, C) : C()
      }

      function _(t, e, i) {
        var o;
        switch (t.type) {
          case r.Feature:
            return o = function (t, e, i) {
              if (null === t.geometry) return e.hasCallbackOrDelegate ? p(e, i, (function () {
                return null
              })) : null;
              if (!s.isValid(t)) throw new u("[MapKit] Expected a GeoJSON " + t.type + " type, instead got " + t);
              var n = g(t.geometry, e, i);
              if (!n) throw new u("[MapKit] " + t + " is an unknown GeoJSON type");
              return n
            }(t, e, i), e.delegate.itemForFeature && p(e, i, (function (i) {
              return a(e.delegate.itemForFeature, e.delegate, [i, t], i)
            })), o;
          case r.FeatureCollection:
            return o = new n([], t), t.features.forEach((function (t) {
              var i = _(t, e, o);
              i && o.items.push(i)
            })), e.hasCallbackOrDelegate && p(e, i, (function () {
              return o._impl.items = o.items.filter((function (t) {
                return !!t
              })), e.delegate.itemForFeatureCollection ? a(e.delegate.itemForFeatureCollection, e.delegate, [o, t], o) : o
            })), o;
          case r.GeometryCollection:
          case r.MultiPoint:
          case r.MultiLineString:
          case r.MultiPolygon:
          case r.Point:
          case r.LineString:
          case r.Polygon:
          case r.Position:
            return g(t, e, i);
          default:
            throw "string" == typeof t.type ? new u('[MapKit] "' + t.type + '" is an unknown GeoJSON type.') : new u("[MapKit] importGeoJSON expects an object with a known GeoJSON `type` property.")
        }
      }
      u.prototype = Object.create(Error.prototype), t.exports = function (t, e) {
        var i = {
          delegate: {},
          itemCount: 0,
          hasCallbackOrDelegate: !1
        };
        e && (i.delegate = e, i.hasCallbackOrDelegate = !0);
        try {
          var o = "[MapKit] importGeoJSON expects an Object and was passed ";
          if (!t) throw new u(o + "a falsy value");
          if (!(t instanceof Object)) throw new u(o + t);
          if (Array.isArray(t)) throw new u(o + "an array");
          var s = _(t, i);
          return i.hasCallbackOrDelegate ? void l.scheduleInBackground((function () {
            var o = void 0 === i.scheduledTaskItem ? s : i.scheduledTaskItem;
            o instanceof n || (o = new n(o, t)), "function" == typeof e ? a(e, null, [null, o]) : i.delegate.geoJSONDidComplete ? (0 === i.itemCount && console.warn("[MapKit] No item is imported with importGeoJSON, either because GeoJSON has no geometries, or the delegate methods did not return any item."), a(i.delegate.geoJSONDidComplete, i.delegate, [o, t])) : console.warn("[MapKit] importGeoJSON was called asynchronously with a delegate object but no `geoJSONDidComplete` method was defined.")
          }), l.Priority.Highest) : (s instanceof n || (s = new n(s, t)), s)
        } catch (n) {
          if (!(n instanceof u)) throw n;
          "function" == typeof i.delegate.geoJSONDidError ? a(i.delegate.geoJSONDidError, i.delegate, [n, t]) : "function" == typeof e ? a(e, null, [n]) : console.error(n.message)
        }
      }
    },
    8316: (t, e, i) => {
      "use strict";
      var n = {
        importGeoJSON: i(1472),
        constants: i(7418),
        validate: i(8157)
      };
      t.exports = n
    },
    8157: (t, e, i) => {
      "use strict";
      var n = i(7418),
        o = {
          Feature: function (t) {
            return s(t, t.geometry && t.geometry.type)
          },
          FeatureCollection: function (t) {
            if (!(t instanceof Object && t.features instanceof Array)) return !1;
            for (var e in t.features) {
              var i = t.features[e];
              if (i.geometry && !s(i, i.geometry.type)) return !1
            }
            return !0
          },
          Position: function (t) {
            return function (t) {
              if (!Array.isArray(t) || t.length < 2) return !1;
              for (var e = 0; e < 2; ++e)
                if ("number" != typeof t[e] || isNaN(t[e])) return !1;
              return !0
            }(t)
          },
          Point: function (t) {
            return r(t, n.Point)
          },
          MultiPoint: function (t) {
            return r(t, n.MultiPoint)
          },
          LineString: function (t) {
            return r(t, n.LineString)
          },
          MultiLineString: function (t) {
            return r(t, n.MultiLineString)
          },
          Polygon: function (t) {
            return r(t, n.Polygon)
          },
          MultiPolygon: function (t) {
            return r(t, n.MultiPolygon)
          },
          GeometryCollection: function (t) {
            if (!(t instanceof Object && t.geometries instanceof Array)) return !1;
            for (var e in t.features) {
              if (!r(t, t.geometries[e].type)) return !1
            }
            return !0
          }
        };

      function s(t, e) {
        return t instanceof Object && (t.type === n.Feature && !!r(t.geometry, e))
      }

      function r(t, e) {
        return t instanceof Object && ((!e || t.type === e) && (((i = t.type) instanceof String || "string" == typeof i) && (t.type === n.GeometryCollection ? o.GeometryCollection(t) : t.type === n.MultiLineString || t.type === n.MultiPolygon || t.type === n.MultiPoint ? function (t) {
          for (var e = 0; e < t.length; e += 1)
            if (!(t[e] instanceof Array)) return !1;
          return !0
        }(t.coordinates) : t.coordinates instanceof Array)));
        var i
      }
      t.exports = {
        isValid: function (t) {
          return !!o[t.type] && o[t.type](t)
        },
        isPosition: function (t) {
          return o.Position(t)
        }
      }
    },
    3306: (t, e, i) => {
      t.exports = {
        BackgroundGridThemes: i(8319).Themes,
        SceneGraphMapNode: i(9313),
        SyrupMapNode: i(2746),
        TileOverlay: i(6737)
      }
    },
    8319: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = {
          light: {
            fillColor: [248, 245, 236],
            lineColor: [149, 148, 144]
          },
          dark: {
            fillColor: [44, 45, 47],
            lineColor: [56, 64, 66]
          }
        };

      function r() {
        n.BaseNode.call(this), this._renderer = new (i(5417))(this), this._theme = s.light
      }
      r.prototype = o.inheritPrototype(n.BaseNode, r, {
        initialRendering: !1,
        get size() {
          return this.parent.size
        },
        get zoom() {
          return this.parent.zoomLevel
        },
        get origin() {
          return this.parent.visibleMapRect.origin
        },
        get theme() {
          return this._theme
        },
        updateThemeFromTint: function (t) {
          var e = s[t];
          e !== this._theme && (this._theme = e, this.needsDisplay = !0)
        },
        stringInfo: function () {
          return "BackgroundGridNode" + (this.initialRendering ? "!" : "") + (this._theme === s.light ? "" : "<dark>")
        }
      }), t.exports = r
    },
    4194: (t, e, i) => {
      var n = i(9328),
        o = i(9601),
        s = i(2114),
        r = i(3658),
        a = i(5524),
        l = i(8489),
        h = i(7575),
        c = i(7046),
        d = i(3433),
        u = i(888),
        p = i(6737),
        m = i(6217),
        g = 1 - Math.pow(2, -52),
        _ = Math.PI / 3,
        f = Math.tan(_ / 2);

      function y(t) {
        this.node = t, this._configuration = null, this._debug = !1, this._language = null, this.allowWheelToZoom = !1, this._pointOfInterestFilter = null, this._showsDefaultTiles = !0, this._tileOverlays = [], this.camera = new a, this._element = document.createElement("div"), this.currentMinZoomLevel = this.minZoomLevel, this.currentMaxZoomLevel = this.maxZoomLevel
      }
      y.prototype = {
        constructor: y,
        get element() {
          return this._element
        },
        deactivate: function () {
          this.node.delegate = null
        },
        destroy: function (t) {
          !t && this.cameraAnimation && this.cameraAnimation.cancel(), this._tileOverlays.forEach((function (t) {
            t.removeEventListener(m.RELOAD_EVENT, this)
          }), this), this._initialInteractionController && (this._initialInteractionController.destroy(), this._initialInteractionController = null), this._panController && (this._panController.destroy(), this._panController = null), this._zoomController && (this._zoomController.destroy(), this._zoomController = null), this._rotationController && (this._rotationController.destroy(), this._rotationController = null), delete this.node.delegate
        },
        minZoomLevel: 3,
        maxZoomLevel: 1 / 0,
        staysCenteredDuringZoom: !1,
        cameraAnimation: null,
        isRotationEnabled: !1,
        isRotationLocked: !0,
        snapsToIntegralZoomLevels: !1,
        get configuration() {
          return this._configuration
        },
        set configuration(t) {
          this._configuration !== t && this.updateConfiguration(t)
        },
        get tint() {
          return this._tint
        },
        get emphasis() {
          return this._emphasis
        },
        setTintAndEmphasis: function (t, e, i) {
          t === this._tint && e === this._tileTint && i === this._emphasis || (this._tint = t, this._tileTint = e, this._emphasis = i, this.updateTintAndEmphasis(t, i))
        },
        get language() {
          return this._language
        },
        set language(t) {
          this._language !== t && (this._language = t, this.refresh())
        },
        get pointOfInterestFilter() {
          return this._pointOfInterestFilter
        },
        set pointOfInterestFilter(t) {
          this._pointOfInterestFilter !== t && (this._pointOfInterestFilter = t, this.updatePointOfInterestFilter())
        },
        get size() {
          return this.camera.viewportSize.copy()
        },
        set size(t) {
          this.adjustForSize(t.copy()), t.width > 0 && t.height > 0 && this._updateZoom(!1)
        },
        adjustForSize: function (t) {
          if (this._visibleMapRect && this._visibleMapRect.size.width > 0 && this._visibleMapRect.size.height > 0 && t.width > 0 && t.height > 0) {
            var e = this._visibleMapRect;
            delete this._visibleMapRect, this.setCameraAnimated(this.camera.withNewMapRect(e, this.snapsToIntegralZoomLevels, t))
          } else {
            var i = null;
            Object.prototype.hasOwnProperty.call(this, "_pendingCameraDistance") && (i = this._pendingCameraDistance);
            var n = this.camera;
            this.setCameraAnimated(new a(n.center, n.zoom, t, n.rotation)), null !== i && this.setCameraDistanceAnimated(i, !1)
          }
        },
        get cameraIsPanning() {
          return !!this._panning
        },
        get pannable() {
          return !!this._panController
        },
        set pannable(t) {
          !t && this._panController ? (this._panController.destroy(), delete this._panController) : t && !this._panController && (this._initialInteractionController || (this._initialInteractionController = new h(this)), this._panController = new d(this))
        },
        get cameraIsZooming() {
          return !!this._zooming || !!this._suspendedZoom
        },
        get zoomable() {
          return !!this._zoomController
        },
        set zoomable(t) {
          !t && this._zoomController ? (this._zoomController.destroy(), delete this._zoomController) : t && !this._zoomController && (this._initialInteractionController || (this._initialInteractionController = new h(this)), this._zoomController = new c(this))
        },
        get cameraIsRotating() {
          return !!this._rotating
        },
        get visibleMapRect() {
          return this._visibleMapRect || this.camera.toMapRect()
        },
        set visibleMapRect(t) {
          this.setVisibleMapRectAnimated(t)
        },
        setVisibleMapRectAnimated: function (t, e) {
          if (this.camera.viewportSize.equals(n.Size.Zero)) this._visibleMapRect = t.copy();
          else {
            var i = this.camera.withNewMapRect(t, this.snapsToIntegralZoomLevels);
            i.rotation = 0, this.setCameraAnimated(i, !!e)
          }
        },
        setCenterAnimated: function (t, e) {
          var i = t.toMapPoint();
          if (this._visibleMapRect) this._visibleMapRect = new o.MapRect(i.x - this._visibleMapRect.size.width / 2, i.y - this._visibleMapRect.size.height / 2, this._visibleMapRect.size.width, this._visibleMapRect.size.height);
          else {
            var n = this.camera.copy();
            n.center = i, this.setCameraAnimated(n, e)
          }
        },
        setCameraBoundaryAnimated: function (t, e) {
          t ? (this._cameraBeforeBoundaryChange = this.camera, this._cameraBoundaryRect = new o.MapRect(t.origin.x, t.origin.y, s.clamp(t.size.width, 0, 1), Math.max(t.size.height, 0)), this.setCameraAnimated(this.camera.copy(), e), delete this._cameraBeforeBoundaryChange) : delete this._cameraBoundaryRect
        },
        constrainCamera: function (t) {
          this._cameraBoundaryRect && (t.center = this._constrainCenterWithinBounds(t.center)), this._updateMinAndMaxZoomLevelsAtY(t.center.y), t.zoom = s.clamp(t.zoom, this.currentMinZoomLevel, this.currentMaxZoomLevel)
        },
        constrainCameraRotation: function (t) {
          var e = this.isRotationLocked;
          if (this.isRotationLocked = t.zoom < 7, 0 !== t.rotation && this.isRotationLocked) return t.rotation = 0, !e && 0 !== this.camera.rotation
        },
        get transformCenter() {
          var t = this.node.delegate;
          return t && "function" == typeof t.mapTransformCenter ? t.mapTransformCenter(this.node) : this.camera.center
        },
        get zoomLevel() {
          return this.camera.zoom
        },
        set zoomLevel(t) {
          this.setZoomLevelAnimated(t)
        },
        setZoomLevelAnimated: function (t, e) {
          if (delete this._cameraDistance, this._suspendedZoom) return this._suspendedZoom.animated = this._suspendedZoom.animated || this._suspendedZoom.level !== t, void (this._suspendedZoom.level = t);
          if (!this.cameraAnimation || e) {
            var i = this.zoomLevel,
              n = s.clamp(t, this.currentMinZoomLevel, this.currentMaxZoomLevel);
            if (i !== n) {
              var o = this.transformCenter,
                r = this.camera;
              o.equals(r.center) ? this.setCameraAnimated(new a(r.center, n, r.viewportSize, r.rotation), e) : this.scaleCameraAroundMapPoint(Math.pow(2, n - i), this.transformCenter, e)
            }
          } else this.cameraAnimation.additiveZoom = t
        },
        setCameraDistanceAnimated: function (t, e) {
          if (0 !== this.camera.viewportSize.width) {
            var i = this.zoomLevelForCameraDistanceAtY(t, this.camera.center.y);
            this.snapsToIntegralZoomLevels && (i = r.getIntegralZoom(i)), this.setZoomLevelAnimated(i, e), this._cameraDistance = t
          } else this._pendingCameraDistance = t
        },
        getCurrentCameraDistance: function () {
          return this.visibleMapRect.size.width / 2 / o.mapUnitsPerMeterAtLatitude(this.camera.center.toCoordinate().latitude) / f
        },
        get cameraZoomRange() {
          return this._cameraZoomRange ? this._cameraZoomRange.copy() : new o.CameraZoomRange
        },
        setCameraZoomRangeAnimated: function (t, e) {
          t ? this._cameraZoomRange = t.copy() : delete this._cameraZoomRange, this._updateZoom(e)
        },
        zoomLevelForCameraDistanceAtY: function (t, e) {
          return this._zoomLevelForCameraDistanceAtLatitude(t, o.convertYToLatitude(e))
        },
        adjustMapItemPoint: function (t) {
          if (this.cameraIsZooming || this._pendingCameraDrawingReadiness) return t;
          if (!this._pointAdjustmentReference) {
            var e = this.camera.zoom,
              i = this.visibleMapRect.origin,
              s = new u(this.camera),
              a = s.zoom,
              l = s.mapRect.origin,
              h = Math.pow(2, e - a),
              c = o.pointsPerAxis(a) * h;
            this._pointAdjustmentReference = new n.Point((l.x - i.x) * c, (l.y - i.y) * c)
          }
          return t.x = r.roundToDevicePixel(this._pointAdjustmentReference.x) + r.roundToDevicePixel(t.x - this._pointAdjustmentReference.x), t.y = r.roundToDevicePixel(this._pointAdjustmentReference.y) + r.roundToDevicePixel(t.y - this._pointAdjustmentReference.y), t
        },
        scaleCameraAroundMapPoint: function (t, e, i) {
          var n = o.pointsPerAxis(this.currentMinZoomLevel),
            s = this.camera.viewportSize.width / (this.visibleMapRect.size.width * n),
            r = this.camera.viewportSize.height / (this.visibleMapRect.size.height * n),
            a = Math.min(1 / t, s, r),
            l = e.x + (e.x < 1 ? 1 : -1),
            h = this.visibleMapRect;
          l >= h.origin.x && l <= h.maxX() && (e = new o.MapPoint(l, e.y));
          var c = this.camera.withNewMapRect(h.scale(a, e), !1);
          this.setCameraAnimated(c, i)
        },
        setCameraAnimated: function (t, e, i, n) {
          if (0 === t.viewportSize.width || 0 === t.viewportSize.height) return this._pendingCameraDrawingReadiness = !0, void (this.camera = t);
          delete this._pendingCameraDistance;
          var o = this.camera;
          t.viewportSize.equals(o.viewportSize) || (this._updateMinAndMaxZoomLevels(t.viewportSize), !e && this.cameraAnimation && this.cameraAnimation.updateViewportSize(t.viewportSize)), n || this.constrainCamera(t);
          var r, a = this.constrainCameraRotation(t),
            h = t.toMapRect().size,
            c = h.width / 2,
            d = h.height / 2;
          (t.center.x = s.mod(t.center.x - c, 1) + c, t.center.y = s.clamp(t.center.y, d, g - d), this._pendingCameraDrawingReadiness || !t.equals(o)) && (delete this._pendingCameraDrawingReadiness, this._cameraWillChange(!!e), !e && !a || this.cameraAnimation ? (delete this._pointAdjustmentReference, this.camera = t, this.cameraZoomWasSet(), this._cameraDidChange()) : (e ? r = this._cameraBeforeBoundaryChange || o : (r = t.copy()).rotation = o.rotation, this._cameraChangesMayHaveStarted(), this.cameraAnimation = new l(this, r, t, i), this._cameraBeforeBoundaryChange && (this.cameraAnimation.unconstrained = !0), this.cameraAnimation.rotating && (this._rotating = !0), this.cameraAnimation.zooming && this.cameraZoomWasSet(t)))
        },
        cameraWillStartZooming: function (t, e, i) {
          var n = this.node.delegate,
            o = function () {
              return !!n && "function" == typeof n.mapCanStartZooming && !n.mapCanStartZooming(this.node)
            }.bind(this);
          return this.cameraAnimation ? !(this._zoomController.active || this.cameraAnimation.zooming || o()) && (this._suspendedZoom = {
            animated: !!e,
            offCenter: !!i,
            level: this.zoomLevel,
            completed: !1
          }, !0) : o() ? (this._zoomController.interrupt(), !1) : (this._cameraWillStartZooming(n, t, e, i), !0)
        },
        _cameraWillStartZooming: function (t, e, i, n) {
          t && "function" == typeof t.mapWillStartZooming && t.mapWillStartZooming(this.node, e, i, n), this._cameraChangesMayHaveStarted(), this._zooming = !0, this.beforeCameraZoomChange(!0), this._cameraWillChange(!!i)
        },
        cameraDidStopZooming: function () {
          if (this.snapsToIntegralZoomLevels && (this.camera.zoom = Math.round(this.camera.zoom)), this._suspendedZoom) this._suspendedZoom.complete = !0;
          else {
            delete this._zooming, this.beforeCameraZoomChange(!1), this._cameraDidChange(), this._cameraChangesMayHaveEnded();
            var t = this.node.delegate;
            t && "function" == typeof t.mapDidStopZooming && t.mapDidStopZooming(this.node)
          }
        },
        cameraWillStartRotating: function () {
          var t = this.node.delegate;
          !!t && "function" == typeof t.mapCanStartRotating && !t.mapCanStartRotating(this.node) || (this._cameraChangesMayHaveStarted(), this._rotating = !0, this._cameraWillChange())
        },
        cameraDidStopRotating: function () {
          if (this._rotating) {
            delete this._rotating, this._cameraDidChange(), this._cameraChangesMayHaveEnded();
            var t = this.node.delegate;
            t && "function" == typeof t.mapDidStopRotating && t.mapDidStopRotating(this.node)
          }
        },
        migrateStateTo: function (t) {
          t.configuration = this.node.configuration, t.tint = this.node.tint, t.language = this.node.language, t.pannable = this.node.pannable, t.allowWheelToZoom = this.node.allowWheelToZoom, t.pointOfInterestFilter = this.node._impl.pointOfInterestFilter, t.showsDefaultTiles = this.node.showsDefaultTiles, t.tileOverlays = this.node.tileOverlays, t.size = this.node.size, t.staysCenteredDuringZoom = this.node.staysCenteredDuringZoom;
          var e = this.node.visibleMapRect;
          e.size.width > 0 && e.size.height > 0 && (t.visibleMapRect = e), t.zoomable = this.node.zoomable, t.isRotationEnabled = this.isRotationEnabled, t.rotation = this.rotation, this._cameraZoomRange && t.setCameraZoomRangeAnimated(this._cameraZoomRange, !1), this._cameraDistance >= 0 && t.setCameraDistanceAnimated(this._cameraDistance, !1), this._cameraBoundaryRect && t.setCameraBoundaryAnimated(this._cameraBoundaryRect, !1), t._impl.debug = this.debug, t._impl.isRotationLocked = this.isRotationLocked, this.cameraAnimation && (this.cameraAnimation.map = t._impl, t._impl.cameraAnimation = this.cameraAnimation, this.cameraChangesHaveStarted && (t._impl.cameraChangesHaveStarted = !0))
        },
        createLabelRegion: s.noop,
        updatedLabelRegion: s.noop,
        unregisterLabelRegion: s.noop,
        get debug() {
          return this._debug
        },
        set debug(t) {
          this._debug !== !!t && (this._debug = !!t, this.refresh())
        },
        updateConfiguration: function (t) {
          this._configuration = t, this._updateMinAndMaxZoomLevels(this.camera.viewportSize), this.setCameraAnimated(this.camera), this.refresh()
        },
        updatePointOfInterestFilter: function () {
          this.refresh()
        },
        refresh: function () { },
        beforeCameraZoomChange: function () { },
        cameraZoomWasSet: function () { },
        get showsDefaultTiles() {
          return this._showsDefaultTiles
        },
        set showsDefaultTiles(t) {
          this._showsDefaultTiles !== t && (this._showsDefaultTiles = t, this._tileOverlaysDidChange())
        },
        get tileOverlays() {
          return this._tileOverlays
        },
        set tileOverlays(t) {
          if (0 !== this._tileOverlays.length || 0 !== t.length) {
            var e = "[MapKit] Map.tileOverlays should be an array, got `" + t + "` instead.";
            s.checkArray(t, e), t.forEach((function (t) {
              s.checkInstance(t, p, "[MapKit] Map.tileOverlays can only contain TileOverlays, but got `" + t + "` instead.")
            })), this._tileOverlays.forEach((function (t) {
              t.removeEventListener(m.RELOAD_EVENT, this)
            }), this), this._tileOverlays = t, this._tileOverlays.forEach((function (t) {
              t.addEventListener(m.RELOAD_EVENT, this)
            }), this), this._tileOverlaysDidChange()
          }
        },
        addTileOverlay: function (t) {
          return s.checkInstance(t, p, "[MapKit] Map.addTileOverlay expected a TileOverlay, but got `" + t + "` instead."), this.addTileOverlays([t]), t
        },
        addTileOverlays: function (t) {
          var e = "[MapKit] Map.addTileOverlays expected an array, but got `" + t + "` instead.";
          return s.checkArray(t, e), t.forEach((function (t) {
            if (s.checkInstance(t, p, "[MapKit] Map.addTileOverlays expected only TileOverlays, but got `" + t + "` instead."), "number" == typeof t.minimumZ && t.minimumZ < this.currentMinZoomLevel) {
              var e = Math.ceil(100 * this.currentMinZoomLevel) / 100;
              console.warn("[MapKit] This TileOverlay has its minimumZ set to " + t.minimumZ + ", but this map can only zoom to a minimum value of " + e + ". As a result, some zoom levels supported by the TileOverlay cannot be viewed on this map.")
            }
          }), this), this.tileOverlays = this.tileOverlays.concat(t), t
        },
        removeTileOverlay: function (t) {
          return s.checkInstance(t, p, "[MapKit] Map.removeTileOverlay expected a TileOverlay, but got `" + t + "` instead."), this.tileOverlays = this.tileOverlays.filter((function (e) {
            return e !== t
          })), t
        },
        removeTileOverlays: function (t) {
          var e = "[MapKit] Map.removeTileOverlays expected an array, but got `" + t + "` instead.";
          return s.checkArray(t, e), t.forEach((function (t) {
            s.checkInstance(t, p, "[MapKit] Map.removeTileOverlays expected only TileOverlays, but got `" + t + "` instead."), this.removeTileOverlay(t)
          }), this), t
        },
        handleEvent: function () { },
        cameraWillStartPanning: function () {
          var t = this.node.delegate,
            e = function () {
              return !!t && "function" == typeof t.mapCanStartPanning && !t.mapCanStartPanning(this.node)
            }.bind(this);
          this.cameraAnimation || e() ? this._panController.interrupt() : (t && "function" == typeof t.mapWillStartPanning && t.mapWillStartPanning(this.node), this.refresh(), this._cameraChangesMayHaveStarted(), this._panning = !0, this._cameraWillChange())
        },
        cameraWillStopPanning: function () {
          var t = this.node.delegate;
          t && "function" == typeof t.mapWillStopPanning && t.mapWillStopPanning(this.node)
        },
        cameraDidStopPanning: function () {
          delete this._panning, this._cameraDidChange(), this._cameraChangesMayHaveEnded();
          var t = this.node.delegate;
          t && "function" == typeof t.mapDidStopPanning && t.mapDidStopPanning(this.node)
        },
        cameraAnimationDidProgress: function (t, e) {
          this.setCameraAnimated(t, !1, null, e)
        },
        cameraAnimationDidEnd: function () {
          var t = this.cameraAnimation;
          this.cameraAnimation = null;
          var e = !1;
          if (t.zooming && !t.zoomIsAdditive && (this.cameraDidStopZooming(), e = !0), t.rotating && (this.cameraDidStopRotating(), e = !0), e || this._cameraDidChange(), this._cameraChangesMayHaveEnded(), this._suspendedZoom) {
            var i = this._suspendedZoom;
            delete this._suspendedZoom, this._cameraWillStartZooming(this.node.delegate, "", i.animated), i.complete && (this.setZoomLevelAnimated(i.level, i.animated), i.animated || this.cameraDidStopZooming())
          }
          this._nextCameraZoomRange && (this.setCameraZoomRangeAnimated(this._nextCameraZoomRange, !1), delete this._nextCameraZoomRange)
        },
        interactionDidStart: function () {
          this._panController && this._panController.stopDecelerating(), this._zoomController && this._zoomController.stopDecelerating(), this._rotationController && this._rotationController.stopDecelerating()
        },
        beganRecognizingRotation: function () {
          this._zoomController && (this._zoomController._singleTapWithTwoFingersRecognizer.enabled = !1), this.isRotationLocked && (this.restrictedCamera = this.camera.copy(), this.restrictIncomingRotation = !0)
        },
        finishedRecognizingRotation: function () {
          this._zoomController && (this._zoomController._singleTapWithTwoFingersRecognizer.enabled = !0), this.resetRestrictedCamera()
        },
        compassRotationWillStart: function () {
          if (this.isRotationLocked) return this.restrictedCamera = this.camera.copy(), this.restrictIncomingRotation = !1, !0
        },
        compassRotationDidEnd: function () {
          this.resetRestrictedCamera()
        },
        resetRestrictedCamera: function () {
          this.restrictedCamera && (this.restrictedCamera.rotation = 0, this.setCameraAnimated(this.restrictedCamera, !0), delete this.restrictedCamera, delete this.restrictIncomingRotation)
        },
        tileGridDidFinishRendering: function () {
          var t = this.node.delegate;
          t && "function" == typeof t.mapDidFinishRendering && t.mapDidFinishRendering(this.node)
        },
        updateMinAndMaxZoomLevelsWhenConfigurationChanges: function () {
          this.minZoomLevel = 0, this.maxZoomLevel = this.constructor.prototype.maxZoomLevel, this._configuration.tileSources.forEach((function (t) {
            this.minZoomLevel = Math.max(this.minZoomLevel, t.minZoomLevel), this.maxZoomLevel = Math.min(this.maxZoomLevel, t.maxZoomLevel)
          }), this), this.minAndMaxZoomLevelsWereUpdated(), this.currentMinZoomLevel = this.minZoomLevel, this.currentMaxZoomLevel = this.maxZoomLevel
        },
        minAndMaxZoomLevelsWereUpdated: function () { },
        _updateMinAndMaxZoomLevels: function (t) {
          if (t.width <= 0 || t.height <= 0) return !1;
          this._configuration && this.updateMinAndMaxZoomLevelsWhenConfigurationChanges(), this.minZoomLevel = Math.max(this.minZoomLevel, this.minZoomLevelForViewportSize(t, o.tileSize)), this.snapsToIntegralZoomLevels && (this.minZoomLevel = Math.ceil(this.minZoomLevel)), this.currentMinZoomLevel = Math.max(this.currentMinZoomLevel, this.minZoomLevel), this.adjustForSize(this.size)
        },
        _cameraChangesMayHaveStarted: function (t) {
          if (!(this.cameraChangesHaveStarted || this._panning || this._zooming || this._rotating || this.cameraAnimation)) {
            this.cameraChangesHaveStarted = !0;
            var e = this.node.delegate;
            e && "function" == typeof e.mapCameraChangesWillStart && e.mapCameraChangesWillStart(this.node, t)
          }
        },
        _cameraWillChange: function (t) {
          this._cameraChangesMayHaveStarted(t), this._cameraWillChangeAnimated = !!t;
          var e = this.node.delegate;
          e && "function" == typeof e.mapCameraWillChange && e.mapCameraWillChange(this.node, !!t)
        },
        _cameraDidChange: function () {
          var t = this.node.delegate;
          t && "function" == typeof t.mapCameraDidChange && t.mapCameraDidChange(this.node, !!this._cameraWillChangeAnimated), delete this._cameraWillChangeAnimated, this._cameraChangesMayHaveEnded()
        },
        _cameraChangesMayHaveEnded: function (t) {
          if (this.cameraChangesHaveStarted && !this._panning && !this._zooming && !this._rotating && !this.cameraAnimation) {
            delete this.cameraChangesHaveStarted;
            var e = this.node.delegate;
            return e && "function" == typeof e.mapCameraChangesDidEnd && e.mapCameraChangesDidEnd(this.node), !0
          }
        },
        isMapPointWithinBounds: function (t) {
          if (!this._cameraBoundaryRect) return !0;
          var e = this._constrainCenterWithinBounds(t);
          return t.x === e.x && t.y === e.y
        },
        _constrainCenterWithinBounds: function (t) {
          if (0 === this.camera.viewportSize.width || 0 === this.camera.viewportSize.height) return t;
          var e = this.camera.center,
            i = this.transformCenter,
            n = e.x - i.x,
            r = e.y - i.y,
            a = s.mod(this._cameraBoundaryRect.origin.x + n, 1),
            l = a + this._cameraBoundaryRect.size.width,
            h = s.mod(t.x, 1);
          if (h < a && (h += 1), h > l) {
            var c = h - a;
            c > .5 && (c = 1 - c);
            var d = h - l;
            d > .5 && (d = 1 - d), h = c < d ? a : l
          }
          var u = s.clamp(t.y, this._cameraBoundaryRect.minY() + r, this._cameraBoundaryRect.maxY() + r);
          return h !== t.x || u !== t.y ? new o.MapPoint(h, u) : t
        },
        _updateMinAndMaxZoomLevelsAtY: function (t) {
          var e = this.minZoomLevel,
            i = this.maxZoomLevel;
          if (this._cameraZoomRange) {
            var n = o.convertYToLatitude(t);
            e = s.clamp(this._zoomLevelForCameraDistanceAtLatitude(this._cameraZoomRange.maxCameraDistance, n), e, i), i = s.clamp(this._zoomLevelForCameraDistanceAtLatitude(this._cameraZoomRange.minCameraDistance, n), e, i), this.snapsToIntegralZoomLevels && (e = Math.ceil(e), i = Math.floor(i))
          }
          this.currentMinZoomLevel = e, this.currentMaxZoomLevel = i
        },
        _updateZoom: function (t) {
          this._updateMinAndMaxZoomLevelsAtY(this.camera.center.y);
          var e = s.clamp(this.camera.zoom, this.currentMinZoomLevel, this.currentMaxZoomLevel);
          if (e !== this.camera.zoom) t && (this._nextCameraZoomRange = this._cameraZoomRange, delete this._cameraZoomRange), this.setZoomLevelAnimated(e, t);
          else {
            var i = this.node.delegate;
            i && "function" == typeof i.mapMinAndMaxZoomLevelsDidChange && i.mapMinAndMaxZoomLevelsDidChange(this.node)
          }
        },
        _zoomLevelForCameraDistanceAtLatitude: function (t, e) {
          var i = 2 * (f * t) * o.mapUnitsPerMeterAtLatitude(e);
          return s.log2(this.camera.viewportSize.width / i / o.tileSize)
        }
      }, t.exports = y
    },
    3279: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = i(8961);

      function r() {
        n.GroupNode.call(this)
      }
      r.prototype = o.inheritPrototype(n.GroupNode, r, {
        delegate: null,
        deactivate: function () {
          this._impl.deactivate()
        },
        destroy: function (t) {
          this._impl.destroy(t)
        },
        get element() {
          return this._impl.element
        },
        get camera() {
          return this._impl.camera
        },
        get minZoomLevel() {
          return this._impl.currentMinZoomLevel
        },
        get maxZoomLevel() {
          return this._impl.currentMaxZoomLevel
        },
        get staysCenteredDuringZoom() {
          return this._impl.staysCenteredDuringZoom
        },
        set staysCenteredDuringZoom(t) {
          this._impl.staysCenteredDuringZoom = t
        },
        get configuration() {
          return this._impl.configuration
        },
        set configuration(t) {
          this._impl.configuration = t
        },
        get tint() {
          return this._impl.tint
        },
        get emphasis() {
          return this._impl.emphasis
        },
        get language() {
          return this._impl.language
        },
        set language(t) {
          this._impl.language = t
        },
        get allowWheelToZoom() {
          return this._impl.allowWheelToZoom
        },
        set allowWheelToZoom(t) {
          this._impl.allowWheelToZoom = t
        },
        get pointOfInterestFilter() {
          return this._impl.pointOfInterestFilter
        },
        set pointOfInterestFilter(t) {
          this._impl.pointOfInterestFilter = t
        },
        get backgroundGridTheme() {
          return this._impl.backgroundGridTheme
        },
        set backgroundGridTheme(t) {
          this._impl.backgroundGridTheme = t
        },
        get size() {
          return this._impl.size
        },
        set size(t) {
          this._impl.size = t
        },
        get rotation() {
          return this._impl.rotation
        },
        set rotation(t) {
          this._impl.rotation = t
        },
        getRotation: function () {
          return this._impl.rotation
        },
        get isRotationEnabled() {
          return this._impl.isRotationEnabled
        },
        set isRotationEnabled(t) {
          this._impl.isRotationEnabled = t
        },
        get isRotationLocked() {
          return this._impl.isRotationLocked
        },
        get cameraIsPanning() {
          return this._impl.cameraIsPanning
        },
        get pannable() {
          return this._impl.pannable
        },
        set pannable(t) {
          this._impl.pannable = t
        },
        get cameraIsZooming() {
          return this._impl.cameraIsZooming
        },
        get zoomable() {
          return this._impl.zoomable
        },
        set zoomable(t) {
          this._impl.zoomable = t
        },
        get cameraIsRotating() {
          return this._impl.cameraIsRotating
        },
        get cameraIsAnimating() {
          return !!this._impl.cameraAnimation
        },
        get zoomLevel() {
          return this._impl.zoomLevel
        },
        set zoomLevel(t) {
          this._impl.setZoomLevelAnimated(t)
        },
        setZoomLevelAnimated: function (t, e) {
          this._impl.setZoomLevelAnimated(t, e)
        },
        setCameraDistanceAnimated: function (t, e) {
          this._impl.setCameraDistanceAnimated(t, e)
        },
        getCurrentCameraDistance: function () {
          return this._impl.getCurrentCameraDistance()
        },
        get cameraZoomRange() {
          return this._impl.cameraZoomRange
        },
        setCameraZoomRangeAnimated: function (t, e) {
          this._impl.setCameraZoomRangeAnimated(t, e)
        },
        zoomLevelForCameraDistanceAtY: function (t, e) {
          return this._impl.zoomLevelForCameraDistanceAtY(t, e)
        },
        get visibleMapRect() {
          return this._impl.visibleMapRect
        },
        set visibleMapRect(t) {
          this._impl.setVisibleMapRectAnimated(t)
        },
        setVisibleMapRectAnimated: function (t, e) {
          this._impl.setVisibleMapRectAnimated(t, e)
        },
        setCenterAnimated: function (t, e) {
          this._impl.setCenterAnimated(t, e)
        },
        setCameraBoundaryAnimated: function (t, e) {
          this._impl.setCameraBoundaryAnimated(t, e)
        },
        isMapPointWithinBounds: function (t) {
          return this._impl.isMapPointWithinBounds(t)
        },
        get showsDefaultTiles() {
          return this._impl.showsDefaultTiles
        },
        set showsDefaultTiles(t) {
          this._impl.showsDefaultTiles = t
        },
        get tileOverlays() {
          return this._impl.tileOverlays
        },
        set tileOverlays(t) {
          this._impl.tileOverlays = t
        },
        addTileOverlay: function (t) {
          return this._impl.addTileOverlay(t)
        },
        addTileOverlays: function (t) {
          return this._impl.addTileOverlays(t)
        },
        removeTileOverlay: function (t) {
          return this._impl.removeTileOverlay(t)
        },
        removeTileOverlays: function (t) {
          return this._impl.removeTileOverlays(t)
        },
        adjustMapItemPoint: function (t) {
          return this._impl.adjustMapItemPoint(t)
        },
        cameraWillStartZooming: function (t, e, i) {
          return this._impl.cameraWillStartZooming(t, e, i)
        },
        cameraDidStopZooming: function () {
          this._impl.cameraDidStopZooming()
        },
        get fullyRendered() {
          return this._impl.fullyRendered
        },
        devicePixelRatioDidChange: function () {
          return this._impl.devicePixelRatioDidChange()
        },
        stringInfo: function () {
          return this._impl.stringInfo()
        },
        get snapsToIntegralZoomLevels() {
          return this._impl.snapsToIntegralZoomLevels
        },
        set snapsToIntegralZoomLevels(t) {
          this._impl.snapsToIntegralZoomLevels = t
        },
        migrateStateTo: function (t) {
          return this._impl.migrateStateTo(t)
        },
        needsReplacing: function (t) {
          return this._impl.needsReplacing(t)
        },
        createLabelRegion: function () {
          return this._impl.createLabelRegion()
        },
        updatedLabelRegion: function () {
          this._impl.updatedLabelRegion()
        },
        unregisterLabelRegion: function (t) {
          this._impl.unregisterLabelRegion(t)
        },
        setCameraAnimated: function (t, e, i) {
          this._impl.setCameraAnimated(t, e, i)
        },
        setTintAndEmphasis: function (t, e, i) {
          this._impl.setTintAndEmphasis(t, e, i)
        },
        compassRotationWillStart: function () {
          return this._impl.compassRotationWillStart()
        },
        compassRotationDidEnd: function () {
          this._impl.compassRotationDidEnd()
        }
      }), s.EventTarget(r.prototype), t.exports = r
    },
    8489: (t, e, i) => {
      var n = i(5524),
        o = i(9601),
        s = i(4937);

      function r(t, e, i, n) {
        this.map = t, this._startCamera = e, this._endCamera = i, this._duration = 250, this._rotationCenter = n, t.snapsToIntegralZoomLevels && (i.zoom = Math.round(i.zoom)), this._updateAnimationRects(), this._startTime = Date.now(), this._schedule()
      }
      r.prototype = {
        constructor: r,
        cancel: function () {
          this._canceled = !0
        },
        get zooming() {
          return this._startCamera.zoom !== this._endCamera.zoom
        },
        set additiveZoom(t) {
          this._zoomIsAdditive = !0, this._endCamera.zoom = t, this._updateAnimationRects()
        },
        get zoomIsAdditive() {
          return this._zoomIsAdditive
        },
        get rotating() {
          return this._startCamera.rotation !== this._endCamera.rotation
        },
        adjustRotation: function (t, e) {
          this._startCamera.rotateAroundCenter(t, e), this._endCamera.rotateAroundCenter(t, e), this._updateAnimationRects()
        },
        unconstrained: !1,
        updateViewportSize: function (t) {
          this._startCamera = new n(this._startCamera.center, this._startCamera.zoom, t, this._startCamera.rotation), this._endCamera = new n(this._endCamera.center, this._endCamera.zoom, t, this._endCamera.rotation), this._updateAnimationRects()
        },
        performScheduledUpdate: function () {
          this._canceled || this._animationDidProgress(Math.min((Date.now() - this._startTime) / this._duration, 1))
        },
        _zoomIsAdditive: !1,
        _updateAnimationRects: function () {
          if (this._rotationDelta = this._endCamera.rotation - this._startCamera.rotation, Math.abs(this._rotationDelta) > 180 && (this._rotationDelta = this._endCamera.rotation + 360 - this._startCamera.rotation), !this._rotationCenter) {
            this._startRect = this._startCamera.toMapRect(), this._animatedEndRect = this._endCamera.toMapRect();
            var t = this._startCamera.center.x - this._endCamera.center.x;
            Math.abs(t) > .5 && (t < 0 ? this._startRect.origin.x += 1 : this._animatedEndRect.origin.x += 1)
          }
        },
        _schedule: function () {
          s.scheduleOnNextFrame(this)
        },
        _animationDidProgress: function (t) {
          if (1 === t) return this.map.snapsToIntegralZoomLevels && (this._endCamera.zoom = Math.round(this._endCamera.zoom)), this.map.cameraAnimationDidProgress(this._endCamera), void this.map.cameraAnimationDidEnd();
          this._rotationCenter ? this._animateAroundCenter(t) : this._animateRects(t), this._schedule()
        },
        _animateAroundCenter: function (t) {
          var e = this._startCamera.copy();
          e.rotateAroundCenter(this._rotationCenter, t * this._rotationDelta), this.map.cameraAnimationDidProgress(e)
        },
        _animateRects: function (t) {
          var e = this._startRect,
            i = this._animatedEndRect,
            n = e.origin.x,
            s = e.origin.y,
            r = e.size.width,
            a = e.size.height,
            l = i.origin.x - e.origin.x,
            h = i.origin.y - e.origin.y,
            c = i.size.width - e.size.width,
            d = i.size.height - e.size.height,
            u = this._endCamera.rotation - this._startCamera.rotation;
          Math.abs(u) > 180 && (u = this._endCamera.rotation + 360 - this._startCamera.rotation);
          var p = new o.MapRect(n + l * t, s + h * t, r + c * t, a + d * t),
            m = this._startCamera.withNewMapRect(p);
          this.map.cameraAnimationDidProgress(m, this.unconstrained), this.map.rotation = this._startCamera.rotation + this._rotationDelta * t
        }
      }, t.exports = r
    },
    5524: (t, e, i) => {
      var n = i(9601),
        o = i(4140),
        s = i(2114),
        r = i(210),
        a = i(311);

      function l(t, e, i, s) {
        this.center = t || new n.MapPoint(.5, .5), this.zoom = e || 3, this.viewportSize = i || new o, this.rotation = s || 0
      }
      l.prototype = {
        constructor: l,
        get zoom() {
          return this._zoom
        },
        set zoom(t) {
          this._zoom !== t && (this._zoom = t || 3, this._pointsPerAxis = n.pointsPerAxis(this._zoom))
        },
        get worldSize() {
          return this._pointsPerAxis
        },
        get rotation() {
          return this._rotation
        },
        set rotation(t) {
          var e = s.mod(t, 360);
          this._rotation = e
        },
        minX: function () {
          var t = this.viewportSize.width / this._pointsPerAxis;
          return this.center.x - t / 2
        },
        minY: function () {
          var t = this.viewportSize.height / this._pointsPerAxis;
          return this.center.y - t / 2
        },
        maxX: function () {
          var t = this.viewportSize.width / this._pointsPerAxis;
          return this.center.x + t / 2
        },
        maxY: function () {
          var t = this.viewportSize.height / this._pointsPerAxis;
          return this.center.y + t / 2
        },
        equals: function (t) {
          return this.zoom === t.zoom && this.center.equals(t.center) && this.viewportSize.equals(t.viewportSize) && this.rotation === t.rotation
        },
        copy: function () {
          return new l(this.center, this.zoom, this.viewportSize, this.rotation)
        },
        toString: function () {
          return "Camera(" + ["center: [" + this.center.x + ", " + this.center.y + "]", "zoom: " + this.zoom, "viewportSize: " + this.viewportSize.toString(), "rotation: " + this.rotation].join(", ") + ")"
        },
        toMapRect: function () {
          var t = this.viewportSize.width / this._pointsPerAxis,
            e = this.viewportSize.height / this._pointsPerAxis,
            i = Object.create(n.MapPoint.prototype);
          i.x = this.center.x - t / 2, i.y = this.center.y - e / 2;
          var o = Object.create(n.MapSize.prototype);
          o.width = t, o.height = e;
          var s = Object.create(n.MapRect.prototype);
          return s.origin = i, s.size = o, s
        },
        toRenderingMapRect: function () {
          var t = [new r(this.minX(), this.minY()), new r(this.maxX(), this.minY()), new r(this.maxX(), this.maxY()), new r(this.minX(), this.maxY())];
          if (0 !== this.rotation) {
            var e = (new a).rotate(this.rotation);
            t = t.map((function (t) {
              return e.transformPoint(t)
            }))
          }
          for (var i = t[0].x, o = t[0].y, s = t[0].x, l = t[0].y, h = 1; h < t.length; ++h) {
            var c = t[h];
            c.x < i && (i = c.x), c.x > s && (s = c.x), c.y < o && (o = c.y), c.y > l && (l = c.y)
          }
          var d = s - i,
            u = l - o;
          return new n.MapRect(this.center.x - d / 2, this.center.y - u / 2, d, u)
        },
        translate: function (t) {
          0 !== this.rotation && (t = (new a).rotate(-this.rotation).transformPoint(t));
          var e = Math.round(t.x) / this._pointsPerAxis,
            i = Math.round(t.y) / this._pointsPerAxis,
            o = Object.create(n.MapPoint.prototype);
          o.x = s.mod(this.center.x - e, 1), o.y = s.mod(this.center.y - i, 1);
          var r = Object.create(l.prototype);
          return r.center = o, r._zoom = this._zoom, r._pointsPerAxis = this._pointsPerAxis, r.viewportSize = this.viewportSize, r._rotation = this._rotation, r
        },
        transformMapPoint: function (t) {
          var e = this.viewportSize.width,
            i = this.viewportSize.height,
            n = this.toScreenSpace(t);
          return (new a).translate(e / 2, i / 2).rotate(this.rotation).translate(e / -2, i / -2).transformPoint(n)
        },
        transformGestureCenter: function (t) {
          if (0 === this.rotation) return t;
          var e = this.viewportSize.width,
            i = this.viewportSize.height;
          return (new a).translate(e / 2, i / 2).rotate(-this.rotation).translate(-e / 2, -i / 2).transformPoint(t)
        },
        toScreenSpace: function (t) {
          var e = this._pointsPerAxis;
          return (new a).translate(-this.minX() * e, -this.minY() * e).scale(e).transformPoint(t)
        },
        rotateAroundCenter: function (t, e) {
          var i = (new a).translate(t.x, t.y).rotate(-e).translate(-t.x, -t.y).transformPoint(new r(this.center.x, this.center.y));
          this.center = new n.MapPoint(i.x, i.y), this.rotation += e
        },
        withNewMapRect: function (t, e, i) {
          i = i || this.viewportSize;
          var o = n.zoomLevelForMapRectInViewport(t, i, n.tileSize);
          return new l(new n.MapPoint(t.midX(), t.midY()), e ? Math.floor(o) : o, i, this.rotation)
        }
      }, t.exports = l
    },
    8006: t => {
      t.exports = {
        Tints: {
          Dark: "dark",
          Light: "light"
        },
        FallbackType: {
          SPILE: "TEST_FAILURE",
          FETCH: "TEST_FETCH_FAILURE",
          CACHE: "TEST_CACHE_FALLBACK",
          WEBGL: "TEST_WEBGL_FALLBACK",
          FEATURE: "BOOTSTRAP_FEATURE_FAILURE",
          SUFFICIENT: "BOOTSTRAP_FEATURE_SUFFICIENT",
          RENDER: "SYRUP_RENDER_FAILURE",
          INIT: "SYRUP_INIT_FAILURE",
          CONFIG_CHANGE: "CONFIGURATION_CHANGE_FALLBACK",
          CONFIG_MISSING: "CONFIGURATION_MISSING_FALLBACK"
        },
        WheelEventTimeout: 100,
        WheelZoomFactor: .0075
      }
    },
    4991: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = i(8187);

      function r(t) {
        n.BaseNode.call(this), this._tile = t, this._renderer = new s(this)
      }
      r.prototype = o.inheritPrototype(n.BaseNode, r, {
        get tile() {
          return this._tile
        },
        stringInfo: function () {
          return "DebugNode<x:" + this.tile.x + ",y:" + this.tile.y + ",z:" + this.tile.z + ">"
        }
      }), t.exports = r
    },
    7090: (t, e, i) => {
      var n = i(3658);

      function o(t) {
        this._map = t, this._recognizers = []
      }
      o.prototype = {
        constructor: o,
        get map() {
          return this._map
        },
        canTrustGestureCenter: function (t) {
          return 1 === t.numberOfTouchesRequired || !(n.supportsGestureEvents && !n.supportsTouches && n.insideIframe)
        },
        addRecognizer: function (t) {
          return this._recognizers.push(t), t.target = this.map.node.element, t.addEventListener("statechange", this), t
        },
        interrupt: function () {
          this._recognizers.forEach((function (t) {
            t.enabled = !1, t.enabled = !0
          }))
        },
        centerForGesture: function (t) {
          var e = this.map;
          return e.staysCenteredDuringZoom || !this.canTrustGestureCenter(t) ? e.transformCenter : this._centerWithRecognizer(t)
        },
        destroy: function () {
          for (; this._recognizers.length;) {
            var t = this._recognizers.pop();
            t.enabled = !1, t.target = null, t.removeEventListener("statechange", this)
          }
        }
      }, t.exports = o
    },
    7575: (t, e, i) => {
      var n = i(4902);

      function o(t, e) {
        this._map = t, n.SupportsPointerEvents ? (this._startEventType = "pointerdown", this._touchCount = 0) : n.SupportsTouches ? this._startEventType = "touchstart" : this._startEventType = "mousedown", this._map.element.addEventListener(this._startEventType, this), n.SupportsPointerEvents && (window.addEventListener("pointerup", this), window.addEventListener("pointercancel", this))
      }
      o.prototype = {
        constructor: o,
        handleEvent: function (t) {
          "pointerup" !== t.type && "pointercancel" !== t.type ? ("pointerdown" === t.type && this._touchCount++, ("mousedown" === t.type || "touchstart" === t.type && t.touches.length === t.changedTouches.length || "pointerdown" === t.type && 1 === this._touchCount) && this._map.interactionDidStart()) : this._touchCount--
        },
        destroy: function () {
          this._map.element.removeEventListener(this._startEventType, this), window.removeEventListener("pointerup", this), window.removeEventListener("pointercancel", this)
        }
      }, t.exports = o
    },
    2993: (t, e, i) => {
      var n = i(975),
        o = i(4937),
        s = i(2114),
        r = i(8006),
        a = s.log2(1.03) / (1e3 / 60),
        l = s.log2(.97) / (1e3 / 60),
        h = s.log2(1.06) / (1e3 / 60),
        c = s.log2(.94) / (1e3 / 60),
        d = s.log2(1 + r.WheelZoomFactor),
        u = s.log2(1 - r.WheelZoomFactor);

      function p(t) {
        this.map = t, this._previousZoomLevelDelta = []
      }
      p.prototype = {
        constructor: p,
        _animating: !1,
        zoomToScale: function (t, e) {
          var i = Date.now();
          this._lastUpdateTime = i;
          var r = s.log2(t);
          this.zoomsIn = r > 0, this._lastScaleCenter = e, this._previousZoomLevelDelta.push({
            delta: r,
            timestamp: i
          }), this._animating ? this._accumulatedDesiredZoomLevelDelta += r : (this._cleanupPreviousZoomLevelDelta(), u <= r && r <= d && this._previousZoomLevelDelta.length <= 1 || (this._animating = !0, this._accumulatedZoomLevelDelta = 0, this._accumulatedDesiredZoomLevelDelta = r, this._timeAtLastFrame = i, this._animationEndingTimeoutId ? (clearTimeout(this._animationEndingTimeoutId), this._animationEndingTimeoutId = void 0) : this.map.cameraWillStartZooming(n.ZoomTypes.Scroll), o.scheduleOnNextFrame(this)))
        },
        destroy: function () {
          this.map = null, this._animationEndingTimeoutId && clearTimeout(this._animationEndingTimeoutId)
        },
        performScheduledUpdate: function () {
          if (this.map) {
            var t = Date.now(),
              e = this.zoomsIn ? Math.ceil(this._accumulatedDesiredZoomLevelDelta) : Math.floor(this._accumulatedDesiredZoomLevelDelta),
              i = t - this._timeAtLastFrame,
              n = this._getEstimatedSpeedPerMS() * i;
            if (this._accumulatedZoomLevelDelta += n, this._timeAtLastFrame = t, !(this.zoomsIn && this._accumulatedZoomLevelDelta < e || !this.zoomsIn && this._accumulatedZoomLevelDelta > e)) {
              var s = this.map.zoomLevel,
                a = Math.round(this.map.zoomLevel);
              return this.map.scaleCameraAroundMapPoint(Math.pow(2, a - s), this._lastScaleCenter), this._animating = !1, this._previousEstimatedSpeedPerMS = void 0, void (this._animationEndingTimeoutId = setTimeout(function () {
                this._animationEndingTimeoutId = void 0, this.map.cameraDidStopZooming()
              }.bind(this), r.WheelEventTimeout))
            }
            this.map.scaleCameraAroundMapPoint(Math.pow(2, n), this._lastScaleCenter), o.scheduleOnNextFrame(this)
          }
        },
        _cleanupPreviousZoomLevelDelta: function () {
          for (var t = Date.now() - 100, e = this.zoomsIn ? 1 : -1, i = 0; i < this._previousZoomLevelDelta.length; i++)(this._previousZoomLevelDelta[i].timestamp < t || this._previousZoomLevelDelta[i].delta * e < 0) && this._previousZoomLevelDelta.splice(i, 1)
        },
        _getEstimatedSpeedPerMS: function () {
          if (this._cleanupPreviousZoomLevelDelta(), this._previousZoomLevelDelta.length <= 1) return this._previousEstimatedSpeedPerMS ? this._previousEstimatedSpeedPerMS : this.zoomsIn ? h : c;
          var t = this._previousZoomLevelDelta.reduce((function (t, e) {
            return t + e.delta
          }), 0) / 100;
          return l < t && t < a && (t = this.zoomsIn ? a : l), this._previousEstimatedSpeedPerMS = t, t
        }
      }, t.exports = p
    },
    3433: (t, e, i) => {
      var n = i(4902),
        o = i(210),
        s = i(4937),
        r = i(7090),
        a = i(2114),
        l = .995;

      function h(t) {
        r.call(this, t), this.addRecognizer(new n.Pan).maximumNumberOfTouches = 2
      }
      h.prototype = a.inheritPrototype(r, h, {
        decelerating: !1,
        stopDecelerating: function () {
          this.decelerating && this._decelerationEnded()
        },
        destroy: function () {
          r.prototype.destroy.call(this), this.stopDecelerating()
        },
        handleEvent: function (t) {
          var e = t.target,
            i = this.map;
          i.staysCenteredDuringZoom && i.cameraIsZooming || (e.state === n.States.Began ? i.cameraWillStartPanning() : e.state !== n.States.Ended && e.state !== n.States.Changed || (this._panMapCameraBy(e.translation), e.translation = new o), e.state === n.States.Ended && (this._startDeceleratingWithVelocity(e.velocity), this.decelerating || i.cameraDidStopPanning()))
        },
        performScheduledUpdate: function () {
          if (this.decelerating) {
            var t = Date.now(),
              e = t - this._timeAtPreviousFrame,
              i = Math.exp(Math.log(l) * e),
              n = l * ((1 - i) / .0050000000000000044);
            this._panMapCameraBy(new o(this._velocity.x / 1e3 * n, this._velocity.y / 1e3 * n)), this._velocity.x *= i, this._velocity.y *= i, Math.abs(this._velocity.x) <= 10 && Math.abs(this._velocity.y) <= 10 ? this._decelerationEnded() : (this._timeAtPreviousFrame = t, this._schedule())
          }
        },
        _panMapCameraBy: function (t) {
          var e = this.map;
          e.setCameraAnimated(e.camera.translate(t))
        },
        _startDeceleratingWithVelocity: function (t) {
          this._velocity = t, this.map.cameraWillStopPanning(), Math.pow(t.x, 2) + Math.pow(t.y, 2) < 62500 || (this.decelerating = !0, this._timeAtPreviousFrame = Date.now(), this._schedule())
        },
        _schedule: function () {
          s.scheduleOnNextFrame(this)
        },
        _decelerationEnded: function () {
          this.decelerating = !1, this.map.cameraDidStopPanning()
        }
      }), t.exports = h
    },
    5417: (t, e, i) => {
      var n = i(9328),
        o = i(9601),
        s = i(2114),
        r = 100,
        a = Math.log(10) / Math.log(2);

      function l(t) {
        n.RenderItem.call(this, t)
      }

      function h(t, e, i, n, o, r) {
        i = s.mod(i, e), n = s.mod(n, e), o = Math.ceil(o), r = Math.ceil(r);
        for (var a = Math.ceil(o / e), l = Math.ceil(r / e), h = 0; h < a; ++h) t.fillRect(i + h * e, 0, 1, r);
        for (h = 0; h < l; ++h) t.fillRect(0, n + h * e, o, 1)
      }

      function c(t) {
        return "rgb(" + t.join(",") + ")"
      }

      function d(t, e, i) {
        return Math.round(e * i + t * (1 - i))
      }
      l.prototype = s.inheritPrototype(n.RenderItem, l, {
        draw: function (t, e) {
          var i = this.node,
            l = i.zoom,
            u = Math.pow(2, l % a),
            p = r * u,
            m = p / 10,
            g = Math.min(m, r),
            _ = m < 10 ? 0 : (g - 10) / 90,
            f = i.origin,
            y = o.pointsPerAxis(l),
            v = new n.Point(-f.x * y, -f.y * y),
            w = s.mod(v.x, p) - p,
            b = s.mod(v.y, p) - p,
            C = this.node.theme;
          if (t.fillStyle = c(C.fillColor), t.fillRect(0, 0, i.size.width, i.size.height), !i.initialRendering) {
            var k = 1 - Math.pow(1 - _, 2);
            k > 0 && (t.fillStyle = c(function (t, e, i) {
              if (0 === i) return t;
              if (1 === i) return e;
              return [d(t[0], e[0], i), d(t[1], e[1], i), d(t[2], e[2], i)]
            }(C.fillColor, C.lineColor, k)), h(t, m, w, b, i.size.width, i.size.height)), t.fillStyle = c(C.lineColor), h(t, p, w, b, i.size.width, i.size.height)
          }
        }
      }), t.exports = l
    },
    8187: (t, e, i) => {
      var n = i(9328),
        o = i(2114);

      function s(t) {
        n.RenderItem.call(this, t)
      }
      var r = "rgba(0, 0, 0, 0.5)",
        a = "white",
        l = "rgba(255, 255, 255, 0.75)",
        h = "black";
      s.prototype = o.inheritPrototype(n.RenderItem, s, {
        draw: function (t) {
          var e = this._node.size.width,
            i = "standard" === this._node.tile.settings.configuration.name;
          t.fillStyle = i ? r : l, t.fillRect(0, 0, e, 1), t.fillRect(0, 1, 1, e - 1);
          var n = ["x", "y", "z"].map((function (t) {
            return t + " = " + this._node.tile[t]
          }), this);
          t.font = "12px -apple-system-font", t.beginPath(), t.moveTo(1, 1);
          var o = 1,
            s = 1;
          n.forEach((function (e, i) {
            var n = t.measureText(e).width;
            o = 1 + n + 16, t.lineTo(o, s), s += 20, 0 === i && (s += 8), t.lineTo(o, s)
          })), t.lineTo(1, s), t.closePath(), t.fill(), t.fillStyle = i ? a : h, t.textBaseline = "hanging", n.forEach((function (i, n) {
            t.fillText(i, 9, 9 + 20 * n, e)
          }))
        }
      }), t.exports = s
    },
    8343: (t, e, i) => {
      var n = i(8006).FallbackType,
        o = i(3658),
        s = 0,
        r = 1,
        a = 2,
        l = 3,
        h = 4,
        c = 5;

      function d(t) {
        this.node = t, this._state = s, this._unregisteredLabelRegions = []
      }
      var u = "mapkit-re-bootstrap-notification",
        p = "mapkit-csr-fallback-notification",
        m = "mapkit-zoom-support-notification";
      d.prototype = {
        constructor: d,
        init: function (t, e, i, n, o, s) {
          this._state = r, this.Camera = i, this.Camera.hasRotationLock = !0, this._initialDisplayOptions = o, this.initRenderer(e, t, n).then(this.syrupInitHandler.bind(this, s)).catch(this.syrupInitErrorHandler.bind(this, s))
        },
        initRenderer: function (t, e, i) {
          var o = this._syrupRenderer = new t({
            startInLoCSR: i
          });
          return o.on("invalid-access-key", (function () {
            e.accessKeyHasExpired()
          }), u), o.on("fallback", (function () {
            e.syrupRequestedFallback(n.RENDER)
          }), p), o.on("zoom-support-did-change", function () {
            this.node.didReconfigure()
          }.bind(this), m), o.init(e)
        },
        syrupInitErrorHandler: function (t) {
          if (this._state === h) return this._state = s, void this.destroy();
          this._state = s, t(!0)
        },
        syrupInitHandler: function (t) {
          if (this._state === h) return this._state = l, void this.destroy();
          this._state = a;
          var e = this._syrupRenderer;
          e.setDeterministicCollisions(!0), e.setLanguage(this.node.language), e.setDeterministicCollisions(!1), e.setPixelRatio(o.devicePixelRatio), this._canvas = e.element(), this.updateConfiguration(this.node.configuration, this._initialDisplayOptions), this._initialDisplayOptions = null, this.performScheduledDraw(), this._unregisteredLabelRegions.forEach((function (t) {
            e.registerLabelRegion(t)
          })), delete this._unregisteredLabelRegions, t()
        },
        deactivate: function () {
          this._state !== r ? this._state !== h && (this._state = l) : this._state = h
        },
        destroy: function () {
          this._state !== r ? this._state !== h && this._state !== c && (this._state = c, this._syrupRenderer && (this._syrupRenderer.off("invalid-access-key", null, u), this._syrupRenderer.off("fallback", null, p), this._syrupRenderer.off("zoom-support-did-change", null, m), "function" == typeof this._syrupRenderer.destroy && this._syrupRenderer.destroy(), this._syrupRenderer = null)) : this._state = h
        },
        get snapsToIntegralZoomLevels() {
          return !!this._syrupRenderer && !this._syrupRenderer.supportsNonIntegralZoomLevels()
        },
        getMapFeatureRegions: function () {
          return this._syrupRenderer && this._syrupRenderer.getMapFeatureRegions ? this._syrupRenderer.getMapFeatureRegions() : []
        },
        performScheduledDraw: function () {
          if (this._state === a) {
            var t = [this.node.size.width, this.node.size.height],
              e = new this.Camera(t[0] / t[1]),
              i = this.node.zoomLevel,
              n = [this.node.camera.center.x, 1 - this.node.camera.center.y, 0];
            e.setTarget(n), e.setZoomLevel(i), e.setRotation(this.node.camera.rotation * g * -1), this._syrupRenderer.update(e, t), this._state !== c && (this._syrupRenderer.mapFullyRendered() ? this.node._impl.tileGridDidFinishRendering() : this.node.needsDisplay = !0)
          }
        },
        forceRerender: function () {
          this._state === a && this._syrupRenderer.forceRerender()
        },
        devicePixelRatioDidChange: function () {
          this._syrupRenderer && this._syrupRenderer.setPixelRatio(o.devicePixelRatio)
        },
        frozen: !1,
        get element() {
          return this.canvas
        },
        get canvas() {
          return this._canvas
        },
        get fullyRendered() {
          return this._syrupRenderer && this._syrupRenderer.mapFullyRendered()
        },
        set language(t) {
          this._syrupRenderer && this._syrupRenderer.setLanguage(t)
        },
        updateNetworkConfiguration: function (t) {
          this._syrupRenderer && this._syrupRenderer.updateNetworkConfiguration(t)
        },
        updateConfiguration: function (t, e) {
          this._syrupRenderer && (e.mode = t.name, this._syrupRenderer.setDisplayOptions(e))
        },
        updatePointOfInterestFilter: function (t, e) {
          this.updateConfiguration(t, {
            poiFilter: e
          })
        },
        createLabelRegion: function () {
          if (this._syrupRenderer) {
            var t = this._syrupRenderer.createLabelRegion();
            return this._unregisteredLabelRegions ? this._unregisteredLabelRegions.push(t) : this._syrupRenderer.registerLabelRegion(t), t
          }
        },
        unregisterLabelRegion: function (t) {
          this._unregisteredLabelRegions ? this._unregisteredLabelRegions.splice(this._unregisteredLabelRegions.indexOf(t), 1) : this._syrupRenderer && this._syrupRenderer.unregisterLabelRegion(t)
        }
      };
      var g = Math.PI / 180;
      t.exports = d
    },
    1333: (t, e, i) => {
      var n = i(9601),
        o = i(4902),
        s = i(4937),
        r = i(2114),
        a = i(7090),
        l = 180 / Math.PI,
        h = 3 * l,
        c = 1e-4 * l * 1e3,
        d = .995;

      function u(t) {
        a.call(this, t), this._recognizer = this.addRecognizer(new o.Rotation)
      }
      u.prototype = r.inheritPrototype(a, u, {
        decelerating: !1,
        stopDecelerating: function () {
          this.decelerating && this._decelerationEnded()
        },
        destroy: function () {
          a.prototype.destroy.call(this), this.stopDecelerating(), delete this._recognizer
        },
        handleEvent: function (t) {
          var e = t.target;
          e === this._recognizer && (e.state === o.States.Began && (this.map.beganRecognizingRotation(), this.map.cameraWillStartRotating()), e.state === o.States.Ended && (delete this._restricted, this.map.finishedRecognizingRotation(), this._startDeceleratingWithVelocity(e.velocity)), this._handleRotationChange(t.target))
        },
        _handleRotationChange: function (t) {
          this._lastRotationCenter = this.centerForGesture(t), this.map.cameraIsRotating && t.state === o.States.Changed && (this.map.rotateCameraAroundMapPoint(this._lastRotationCenter, t.rotation), t.rotation = 0)
        },
        _centerWithRecognizer: function (t) {
          var e = this.map,
            i = t.locationInElement(),
            o = this.map.node.convertPointFromPage(i);
          o = e.camera.transformGestureCenter(o);
          var s = e.visibleMapRect,
            r = e.camera.viewportSize;
          return new n.MapPoint(s.minX() + o.x / r.width * s.size.width, s.minY() + o.y / r.height * s.size.height)
        },
        performScheduledUpdate: function () {
          if (this.decelerating) {
            var t = Date.now(),
              e = t - this._timeAtPreviousFrame,
              i = this._velocity / 1e3,
              n = Math.pow(d, e),
              o = d * i * (n - 1) / -.0050000000000000044;
            i *= n, this.map.cameraAnimation ? this.map.cameraAnimation.adjustRotation(this._lastRotationCenter, o) : this.map.rotateCameraAroundMapPoint(this._lastRotationCenter, o), this._velocity *= n, Math.abs(this._velocity) <= c ? this._decelerationEnded() : (this._timeAtPreviousFrame = t, this._schedule())
          }
        },
        _startDeceleratingWithVelocity: function (t) {
          if (Math.abs(t) > 1440 || isNaN(t)) this.map.cameraDidStopRotating();
          else {
            if (Math.abs(t) < h) return this.decelerating = !1, void this.map.cameraDidStopRotating();
            this._velocity = t, this.decelerating = !0, this._timeAtPreviousFrame = Date.now(), this._schedule()
          }
        },
        _schedule: function () {
          s.scheduleOnNextFrame(this)
        },
        _decelerationEnded: function () {
          this.decelerating = !1, this.map.cameraDidStopRotating()
        }
      }), t.exports = u
    },
    9462: (t, e, i) => {
      var n = i(4194),
        o = i(8319),
        s = i(1351),
        r = i(2114);

      function a(t) {
        n.call(this, t), this._backgroundGrid = this.node.addChild(new o), this._tileGridsGroup = this.node.addChild(new s(this)), this._labels = !0, this.rotation = 0, this._backgroundGrid.initialRendering = !0, this._tileGridsGroup.opacity = 0, setTimeout(function () {
          this._backgroundGrid.initialRendering = !1, this._tileGridsGroup.opacity = 1
        }.bind(this), 0)
      }
      a.prototype = r.inheritPrototype(n, a, {
        stringInfo: function () {
          return "MapNode<camera:" + this.camera.toString() + ">"
        },
        get tileSettings() {
          return {
            configuration: this._configuration,
            tint: this._tileTint,
            emphasis: this._emphasis,
            language: this._language,
            showsPOI: this._showsPOI(),
            showsLabels: this._labels,
            showsDefaultTiles: this._showsDefaultTiles,
            showsTileInfo: this._debug,
            tileOverlays: this._tileOverlays
          }
        },
        get fullyRendered() {
          return this._tileGridsGroup.fullyRendered
        },
        get cssBackgroundProperty() {
          return this._tileGridsGroup.cssBackgroundProperty
        },
        get labels() {
          return this._labels
        },
        set labels(t) {
          this._labels = !!t, this.refresh()
        },
        destroy: function (t) {
          n.prototype.destroy.call(this, t), this._tileGridsGroup.destroy()
        },
        updateTintAndEmphasis: function (t, e) {
          this._backgroundGrid.updateThemeFromTint(t), this.refresh()
        },
        refresh: function () {
          this._tileGridsGroup.scheduleRefresh()
        },
        cameraZoomWasSet: function (t) {
          t ? this._tileGridsGroup.cameraWillStartZooming(t) : this._tileGridsGroup.invalidate()
        },
        tileGridDidFinishRendering: function () {
          this._tileOverlays.forEach((function (t) {
            t._impl.reloadComplete()
          }), this), n.prototype.tileGridDidFinishRendering.call(this)
        },
        handleEvent: function () {
          this._tileGridsGroup.scheduleRefresh()
        },
        beforeCameraZoomChange: function (t) {
          t ? this._tileGridsGroup.cameraWillStartZooming() : this._tileGridsGroup.cameraDidStopZooming()
        },
        devicePixelRatioDidChange: function () {
          return this._tileGridsGroup.scheduleRefresh(), !0
        },
        minZoomLevelForViewportSize: function (t, e) {
          var i = Math.max(t.width, t.height),
            n = Math.ceil(i / e);
          return r.log2(n)
        },
        minAndMaxZoomLevelsWereUpdated: function () {
          this.tileOverlays.forEach((function (t) {
            "number" != typeof t.minimumZ || isNaN(t.minimumZ) || (this.minZoomLevel = Math.min(this.minZoomLevel, t.minimumZ)), "number" != typeof t.maximumZ || isNaN(t.maximumZ) || (this.maxZoomLevel = Math.max(this.maxZoomLevel, t.maximumZ))
          }), this)
        },
        _tileOverlaysDidChange: function () {
          this._updateMinAndMaxZoomLevels(this.camera.viewportSize), this._tileGridsGroup.scheduleRefresh()
        },
        _showsPOI: function () {
          return (null == this._pointOfInterestFilter || null == this._pointOfInterestFilter._includes && 0 === this._pointOfInterestFilter._excludes.length) && this.labels
        },
        needsReplacing: function (t) {
          return t
        }
      }), t.exports = a
    },
    9313: (t, e, i) => {
      var n = i(3279),
        o = i(9462),
        s = i(2114),
        r = i(6572);

      function a() {
        n.call(this), Object.defineProperty(this, "_impl", {
          value: new o(this)
        })
      }
      a.prototype = s.inheritPrototype(n, a, {
        get cssBackgroundProperty() {
          return this._impl.cssBackgroundProperty
        },
        get labels() {
          return this._impl.labels
        },
        set labels(t) {
          this._impl.labels = t
        },
        get pointOfInterestFilter() {
          return null === this._impl._pointOfInterestFilter ? null : null === this._impl._pointOfInterestFilter._includes && 0 === this._impl._pointOfInterestFilter._excludes.length ? this._impl._pointOfInterestFilter : r.filterExcludingAllCategories
        },
        set pointOfInterestFilter(t) {
          this._impl.pointOfInterestFilter = t
        },
        get rotation() {
          return 0
        },
        set rotation(t) {
          this._impl.rotation = t
        },
        rotateCameraAroundMapPoint: function (t, e) {
          this._impl.rotation += e
        }
      }), t.exports = a
    },
    8228: (t, e, i) => {
      var n = i(3658),
        o = i(2589),
        s = i(2114),
        r = {
          fontFamily: "-apple-system-font, sans-serif",
          margin: "2em auto",
          width: "20em",
          borderRadius: "0.5em",
          color: "#f8f9f0",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "1em",
          textAlign: "center",
          position: "relative"
        },
        a = {
          listStyleType: "none",
          margin: 0,
          paddingLeft: 0
        },
        l = {
          width: "1em",
          height: "1em",
          position: "absolute",
          top: "0.5em",
          left: "0.5em"
        };

      function h(t, e) {
        this._element = c(document.createElement("div"), r);
        var i = c(this._element.appendChild(document.createElement("ul")), a);
        this._items = [function (t) {
          var e = t.center.toCoordinate();
          return "Center: " + e.latitude.toFixed(6) + ", " + e.longitude.toFixed(6)
        }, function (t) {
          return "Zoom: " + t.zoom.toFixed(6) + ", rotation: " + t.rotation.toFixed(6)
        }, function (t) {
          var e = Math.floor(t.zoom),
            i = Math.pow(2, e);
          return "Center tile: x=" + Math.floor(s.mod(t.center.x, 1) * i) + ", y=" + Math.floor(t.center.y * i) + ", z=" + e
        }, function (t) {
          return "Viewport: " + t.viewportSize.width + "×" + t.viewportSize.height
        }].map((function (t) {
          var e = i.appendChild(document.createElement("li"));
          return function (i) {
            e.textContent = t(i)
          }
        }));
        var h = n.svgElement("svg", {
          viewBox: "-16 -16 32 32"
        }, n.svgElement("circle", {
          r: 16,
          fill: "#ccc"
        }), n.svgElement("g", {
          "stroke-width": 4,
          stroke: "#222"
        }, n.svgElement("line", {
          x1: -8,
          y1: -8,
          x2: 8,
          y2: 8
        }), n.svgElement("line", {
          x1: 8,
          y1: -8,
          x2: -8,
          y2: 8
        })));
        this._element.appendChild(c(h, l)), h.addEventListener("click", t), this.update(e), this.update = o(this.update, 50, this)
      }

      function c(t, e) {
        for (var i in e) t.style[i] = e[i];
        return t
      }
      h.prototype = {
        constructor: h,
        attachTo: function (t) {
          t.appendChild(this._element)
        },
        detach: function () {
          this._element.remove()
        },
        update: function (t) {
          this._items.forEach((function (e) {
            e(t)
          }))
        }
      }, t.exports = h
    },
    9865: (t, e, i) => {
      var n = i(4194),
        o = i(8228),
        s = i(2114),
        r = i(3658),
        a = i(1333),
        l = i(7575),
        h = i(8006).FallbackType;

      function c(t) {
        n.call(this, t), this._renderer = t._renderer, this._requiresFallback = !1, this._fallback = function () {
          this._requiresFallback = !0
        }.bind(this)
      }
      c.prototype = s.inheritPrototype(n, c, {
        init: function (t, e, i, n, o) {
          if (this._requiresFallback) t.syrupRequestedFallback(h.FEATURE);
          else {
            this._fallback = t.syrupRequestedFallback.bind(t, h.FEATURE);
            var s = {
              poiFilter: this._convertPointOfInterestFilter(this.pointOfInterestFilter),
              tint: this.tint,
              emphasis: this.emphasis
            };
            this._renderer.init(this.networkConfigurationFor(t), e, i, n, s, function (t) {
              this._updateMinAndMaxZoomLevels(this.camera.viewportSize), o(t, this._renderer)
            }.bind(this))
          }
        },
        get isRotationEnabled() {
          return this._isRotationEnabled
        },
        set isRotationEnabled(t) {
          !t && this._rotationController ? (this._rotationController.destroy(), delete this._rotationController) : t && !this._rotationController && (this._initialInteractionController || (this._initialInteractionController = new l(this)), this._rotationController = new a(this), this.camera._initialRotation = 0), this._isRotationEnabled = t
        },
        get rotation() {
          return this.camera.rotation
        },
        set rotation(t) {
          if (this._cameraWillChange(), this.camera.rotation = t, this._updateDisplay(), this._cameraDidChange(), !this.cameraAnimation || !this.cameraAnimation.rotating) {
            var e = this.node.delegate;
            e && "function" == typeof e.mapRotationDidChange && e.mapRotationDidChange(this.node)
          }
        },
        updateNetworkConfiguration: function (t) {
          this._renderer.updateNetworkConfiguration(this.networkConfigurationFor(t))
        },
        forceRerender: function () {
          this._renderer.forceRerender()
        },
        adjustForSize: function (t) {
          n.prototype.adjustForSize.call(this, t), this.forceRerender()
        },
        adjustMapItemPoint: function (t) {
          return this.cameraIsZooming || this.cameraIsPanning || this.cameraIsRotating || (t.x = r.roundToDevicePixel(t.x), t.y = r.roundToDevicePixel(t.y)), t
        },
        networkConfigurationFor: function (t) {
          if (!t) return {};
          var e = null;
          return t.proxyPrefixes && !t.customMadabaUrl && (e = t.proxyPrefixes.slice(0)), {
            madabaDomains: t.madabaDomains.slice(0),
            rasterTiles: t.rasterTilesForSyrup,
            proxyPrefixes: e,
            withCredentials: t.withCredentials,
            tileGroup: t.tileGroup,
            accessKey: t.accessKey,
            accessKeyHasExpired: t.accessKeyHasExpired.bind(t),
            syrupRequestedFallback: t.syrupRequestedFallback.bind(t)
          }
        },
        rotateCameraAroundMapPoint: function (t, e) {
          if (this.isRotationLocked) {
            if (!this.restrictedCamera) return;
            if (this.restrictIncomingRotation) {
              var i = s.mod(this.camera.rotation + e, 360),
                n = r.restrictRotation(i);
              n !== i && (e = n - this.camera.rotation)
            }
          }
          if (0 !== e) {
            this._cameraWillChange(), this.camera.rotateAroundCenter(t, e), this.constrainCamera(this.camera), this._updateDisplay(), this._cameraDidChange();
            var o = this.node.delegate;
            o && "function" == typeof o.mapRotationDidChange && o.mapRotationDidChange(this.node)
          }
        },
        deactivate: function () {
          n.prototype.deactivate.call(this), this._renderer.deactivate()
        },
        getMapFeatureRegions: function () {
          return this._renderer.getMapFeatureRegions()
        },
        destroy: function (t) {
          n.prototype.destroy.call(this, t), this.customCanvas && this.customCanvas.parentNode && this.customCanvas.parentNode.removeChild(this.customCanvas), this._renderer && (this._renderer.destroy(), this._renderer = null)
        },
        stringInfo: function () {
          return "SyrupNode<camera:" + this.camera.toString() + ">"
        },
        get backgroundGridTheme() {
          return this._backgroundGridTheme
        },
        set backgroundGridTheme(t) {
          this._backgroundGridTheme = t
        },
        get fullyRendered() {
          return this._renderer.fullyRendered
        },
        get customCanvas() {
          return this._renderer && this._renderer.canvas
        },
        get camera() {
          return this._camera
        },
        set camera(t) {
          this._camera = t, this.node.needsDisplay = !0
        },
        get language() {
          return this._language
        },
        set language(t) {
          this._language !== t && (this._language = t, this._renderer && (this._renderer.language = t, this.node.needsDisplay = !0))
        },
        updateConfiguration: function (t) {
          var e = this._configuration && (t.name !== this._configuration.name || t.provider !== this._configuration.provider);
          n.prototype.updateConfiguration.call(this, t), e && this._renderer && (this._renderer.updateConfiguration(t, {
            poiFilter: this._convertPointOfInterestFilter(this._pointOfInterestFilter)
          }), this.node.needsDisplay = !0)
        },
        updateTintAndEmphasis: function (t, e) {
          this._renderer.node.pendingConfigurationUpdates ? (this._renderer.node.pendingConfigurationUpdates.tint = t, this._renderer.node.pendingConfigurationUpdates.emphasis = e) : this._renderer && this._configuration && (this._renderer.updateConfiguration(this._configuration, {
            poiFilter: this._convertPointOfInterestFilter(this._pointOfInterestFilter),
            tint: t,
            emphasis: e
          }), this.node.needsDisplay = !0)
        },
        updatePointOfInterestFilter: function () {
          if (this._renderer.node.pendingConfigurationUpdates) this._renderer.node.pendingConfigurationUpdates.poiFilterUpdate = !0;
          else if (this._renderer && this._configuration) {
            var t = this._convertPointOfInterestFilter(this._pointOfInterestFilter);
            this._renderer.updatePointOfInterestFilter(this._configuration, t), this.node.needsDisplay = !0
          }
        },
        makePendingConfigurationUpdates: function () {
          var t = this._renderer.node.pendingConfigurationUpdates;
          t && (delete this._renderer.node.pendingConfigurationUpdates, t.tint && t.emphasis && this.updateTintAndEmphasis(t.tint, t.emphasis), t.poiFilter && this.updatePointOfInterestFilter())
        },
        devicePixelRatioDidChange: function () {
          return !this._renderer
        },
        forcedSnapsToIntegralZoomLevels: !1,
        get snapsToIntegralZoomLevels() {
          return this.forcedSnapsToIntegralZoomLevels || this._renderer && this._renderer.snapsToIntegralZoomLevels
        },
        set snapsToIntegralZoomLevels(t) {
          0
        },
        get debug() {
          return this._debug
        },
        set debug(t) {
          this._debug !== !!t && (this._debug = !!t, this._debug ? this._showDebugPanel() : this._hideDebugPanel())
        },
        minZoomLevelForViewportSize: function (t, e) {
          return this._renderer && this._renderer.Camera ? this._renderer.Camera.getMinZoomLevel([t.width, t.height], e) : this.minZoomLevel
        },
        needsReplacing: function (t) {
          return !t
        },
        createLabelRegion: function () {
          return this._renderer.createLabelRegion()
        },
        updatedLabelRegion: function () {
          this.forceRerender(), this.node.needsDisplay = !0
        },
        unregisterLabelRegion: function (t) {
          this._renderer.unregisterLabelRegion(t), this.node.needsDisplay = !0
        },
        _tileOverlaysDidChange: function () {
          this._fallback()
        },
        _showDebugPanel: function () {
          this._debugPanel = new o(function () {
            this.debug = !1
          }.bind(this), this.camera), this._debugPanel.attachTo(this._element), this._cameraDidChange = function () {
            n.prototype._cameraDidChange.call(this), this._debugPanel && this._debugPanel.update(this.camera)
          }
        },
        _hideDebugPanel: function () {
          this._debugPanel.detach(), delete this._debugPanel, delete this._cameraDidChange
        },
        _updateDisplay: function () {
          this.forceRerender(), this.node.needsDisplay = !0
        },
        _convertPointOfInterestFilter: function (t) {
          return null === t ? null : {
            includes: t._includes,
            excludes: t._excludes
          }
        }
      }), t.exports = c
    },
    2746: (t, e, i) => {
      var n = i(3279),
        o = i(8343),
        s = i(9865),
        r = i(2114),
        a = i(4937),
        l = i(8961);

      function h() {
        n.call(this), this._renderer = new o(this), Object.defineProperty(this, "_impl", {
          value: new s(this)
        })
      }
      h.prototype = r.inheritPrototype(n, h, {
        get isRotationEnabled() {
          return this._impl.isRotationEnabled
        },
        set isRotationEnabled(t) {
          this._impl.isRotationEnabled = t
        },
        get customCanvas() {
          return this._impl.customCanvas
        },
        set needsDisplay(t) {
          t && a.scheduleDraw(this._renderer)
        },
        get forcedSnapsToIntegralZoomLevels() {
          return this._impl.forcedSnapsToIntegralZoomLevels
        },
        set forcedSnapsToIntegralZoomLevels(t) {
          this._impl.forcedSnapsToIntegralZoomLevels = t
        },
        init: function (t, e, i, n, o) {
          this._impl.init(t, e, i, n, o)
        },
        updateNetworkConfiguration: function (t) {
          this._impl.updateNetworkConfiguration(t)
        },
        forceRerender: function () {
          this._impl.forceRerender()
        },
        rotateCameraAroundMapPoint: function (t, e) {
          this._impl.rotateCameraAroundMapPoint(t, e)
        },
        makePendingConfigurationUpdates: function () {
          this._impl.makePendingConfigurationUpdates()
        },
        didReconfigure: function () {
          this.dispatchEvent(new l.Event("reconfigured"))
        },
        getMapFeatureRegions: function () {
          return this._impl.getMapFeatureRegions()
        }
      }), t.exports = h
    },
    888: (t, e, i) => {
      var n = i(9601),
        o = i(2114),
        s = i(3658),
        r = i(3769),
        a = i(1644),
        l = i(210);

      function h(t, e) {
        var i = s.getIntegralZoom(t.zoom),
          r = Math.pow(2, i),
          h = Math.pow(2, t.zoom) * n.tileSize,
          c = t.viewportSize.width / h / 2,
          d = t.viewportSize.height / h / 2,
          u = new n.MapPoint(t.center.x - c, t.center.y - d),
          p = new n.MapPoint(t.center.x + c, t.center.y + d),
          m = r - 1,
          g = Math.floor(u.x * r),
          _ = Math.floor(p.x * r),
          f = o.clamp(Math.floor(u.y * r), 0, m),
          y = o.clamp(Math.floor(p.y * r), 0, m);
        this.range = new a(new l(g, f, i), new l(_, y, i)), this.settings = e, this.resolution = s.devicePixelRatio, this.zoom = i, this.mapRect = new n.MapRect(g / r, f / r, (_ - g) / r, (y - f) / r), this.mapRect.size.width < 0 && this.mapRect.size.width++
      }
      h.prototype = {
        constructor: h,
        equals: function (t) {
          return this.sameSettings(t) && this.resolution === t.resolution && this.range.equals(t.range)
        },
        sameSettings: function (t) {
          var e = this.settings,
            i = t.settings;
          return e.configuration === i.configuration && e.tint === i.tint && e.emphasis === i.emphasis && e.showsPOI === i.showsPOI && e.showsLabels === i.showsLabels && e.language === i.language && e.showsDefaultTiles === i.showsDefaultTiles && e.showsTileInfo === i.showsTileInfo && this.sameTileOverlays(t)
        },
        sameTileOverlays: function (t) {
          return this.settings.tileOverlays.length === t.settings.tileOverlays.length && this.settings.tileOverlays.every((function (e, i) {
            return e === t.settings.tileOverlays[i] & !e._impl.stale
          }), this)
        },
        sharesTileSourcesWithTileData: function (t) {
          if (this.settings.tint !== t.settings.tint || this.settings.emphasis !== t.settings.emphasis) return !1;
          var e = this.settings.configuration.tileSources,
            i = t.settings.configuration.tileSources;
          return !("AutoNavi" !== this.settings.configuration.provider || "AutoNavi" !== t.settings.configuration.provider || 1 !== e.length || 1 !== i.length || "satellite" !== e[0].name && "hybrid" !== e[0].name || "satellite" !== i[0].name && "hybrid" !== i[0].name) || i.some((function (t) {
            return -1 !== e.indexOf(t)
          }))
        },
        load: function () {
          this._tiles || (this._tiles = r.tilesForTileData(this))
        },
        cancel: function () {
          if (!this._canceled && (this._canceled = !0, this._tiles))
            for (var t = 0, e = this._tiles, i = e.length; t < i; ++t) e[t].unschedule()
        },
        releaseTiles: function () {
          if (this._tiles)
            for (var t = 0, e = this._tiles, i = e.length; t < i; ++t) r.releaseTile(e[t], this)
        },
        get tiles() {
          return this.load(), this._tiles
        }
      }, t.exports = h
    },
    5639: (t, e, i) => {
      var n = i(9601),
        o = i(9328),
        s = i(2114),
        r = i(4937),
        a = i(4991),
        l = i(8226),
        h = i(5965),
        c = i(8877).State,
        d = new o.Matrix,
        u = new o.Size(n.tileSize, n.tileSize);

      function p(t) {
        o.GroupNode.call(this), this._scale = 1, this._nodesByTileKey = {}, this._fadingNodes = [], this._debug = !!t
      }

      function m(t) {
        var e = new h(t.tileSource);
        return e.size = u, t.loaderState === c.Succeeded && (e.image = t.image, e.opacity = t.preferredOpacity), e
      }
      p.prototype = s.inheritPrototype(o.GroupNode, p, {
        stale: !1,
        fullyRendered: !1,
        _pendingTileCount: 0,
        _tileData: null,
        get locked() {
          return this.wantsLayerBacking
        },
        set locked(t) {
          t !== this.wantsLayerBacking && (t && this._fadingNodes.length > 0 ? this.wantsLayerBacking = !0 : !t && this._wantsLayerBacking ? this.wantsLayerBacking = !1 : this.frozen = t)
        },
        get tileData() {
          return this._tileData
        },
        setTileDataAnimated: function (t, e) {
          this._fadingNodes = [], delete this._failedTileAndImage;
          var i = t.tiles,
            r = t.range.min,
            a = Math.pow(2, r.z);
          this._tileData && this._tileData.tiles.forEach((function (t) {
            if (t.removeEventListener(l.Events.LoadSuccess, this), t.removeEventListener(l.Events.LoadFail, this), -1 === i.indexOf(t)) {
              var e = t.key,
                n = this._nodesByTileKey[e];
              n && (n.remove(), delete this._nodesByTileKey[e])
            }
          }), this), this._tileData = t, this.fullyRendered = !1, this._pendingTileCount = i.length;
          var h = this.childCount,
            c = t.range.min.x,
            d = t.range.max.x - c === a,
            u = a * n.tileSize;
          i.forEach((function (t) {
            var i = new o.Point(s.mod(t.x - r.x, a) * n.tileSize, (t.y - r.y) * n.tileSize),
              p = this._ensureNodeForTile(t);
            p.position = i, p.opacity = 0, d && t.x === c && (p.repeatOffset = u), this.addChild(p), t.loaded ? ((h > 0 || !e) && (p.opacity = 1), this._tileDidLoad(t)) : (e || (p.opacity = 1), t.addEventListener(l.Events.LoadSuccess, this), t.addEventListener(l.Events.LoadFail, this))
          }), this)
        },
        get pendingTileCount() {
          return this._pendingTileCount
        },
        set scale(t) {
          t !== this._scale && (this._scale = t, this.transform = 1 === t ? d : (new o.Matrix).scale(t))
        },
        get debug() {
          return this._debug
        },
        stringInfo: function () {
          return "TileGridNode" + (this.tileData ? "<range:(" + this.tileData.range.toString() + ")>" : "")
        },
        get cssBackgroundProperty() {
          if (!this.fullyRendered) return "";
          var t = this.position;
          return Array.prototype.concat.apply([], this._tileData.tiles.map((function (e) {
            var i = this._nodesByTileKey[e.key];
            return e.tileImages.reduce((function (e, o, s) {
              return "url(" + o.image.src + ") " + (t.x + i.position.x) + "px " + (t.y + i.position.y) + "px / " + n.tileSize + "px no-repeat" + (0 === s ? "" : ", ") + e
            }), "")
          }), this)).join(", ")
        },
        handleEvent: function (t) {
          var e = t.target;
          switch (t.type) {
            case l.Events.LoadSuccess:
              e.removeEventListener(l.Events.LoadSuccess, this), this._tileDidLoad(e);
              break;
            case l.Events.LoadFail:
              this._tileLoadFail(e, t.tileImage)
          }
        },
        performScheduledUpdate: function () {
          this._updateFadingNodes(), 0 === this._pendingTileCount && 0 === this._fadingNodes.length && this._allTilesDidDraw()
        },
        _tileDidLoad: function (t) {
          this._pendingTileCount--, 0 === this._pendingTileCount && this._failedTileAndImage && (this._failedTileAndImage.tile._requestTileImageLoadStatus(this._failedTileAndImage.tileImage, this._handleTileImageLoadStatus.bind(this)), delete this._failedTileAndImage);
          var e = this._nodesByTileKey[t.key];
          if (0 === e.childCount) {
            var i = t.tileImages;
            if (e.children = i.map(m), this.debug) {
              var n = new a(t);
              n.size = u, e.addChild(n)
            }
          }
          e.opacity < 1 ? (this._fadingNodes.push(e), r.scheduleASAP(this)) : 0 === this._pendingTileCount && this._allTilesDidDraw()
        },
        _tileLoadFail: function (t, e) {
          this._failedTileAndImage = {
            tile: t,
            tileImage: e
          }
        },
        _handleTileImageLoadStatus: function (t) {
          if (403 === t.target.status) {
            var e = this.parent._map.node.delegate;
            e && e.tileAccessForbidden()
          }
        },
        _updateFadingNodes: function () {
          var t = Date.now();
          this._fadingNodes = this._fadingNodes.filter((function (e) {
            return e._startTime ? e.opacity = Math.min(1, (t - e._startTime) / 150) : 0 === e.opacity && (e._startTime = t), 1 !== e.opacity || (delete e._startTime, !1)
          })), this._fadingNodes.length > 0 ? r.scheduleOnNextFrame(this) : this._wantsLayerBacking && (this.wantsLayerBacking = !1, this.frozen = !0)
        },
        _allTilesDidDraw: function () {
          this.fullyRendered = !0, this.parent && this.parent.tileGridDidFinishRendering(this)
        },
        _ensureNodeForTile: function (t) {
          var e = t.key,
            i = this._nodesByTileKey[e];
          return i ? delete i.repeatOffset : i = this._nodesByTileKey[e] = new o.GroupNode, i
        }
      }), t.exports = p
    },
    1351: (t, e, i) => {
      var n = i(9601),
        o = i(4937),
        s = i(9328),
        r = i(5639),
        a = i(888),
        l = i(2114),
        h = i(3658);

      function c(t) {
        s.GroupNode.call(this), this._map = t
      }
      c.prototype = l.inheritPrototype(s.GroupNode, c, {
        fullyRendered: !1,
        scheduleRefresh: function () {
          this.children.forEach((function (t) {
            t.stale = !0
          })), this.invalidate()
        },
        destroy: function () {
          this._releaseChildren(!0)
        },
        invalidate: function () {
          this.fullyRendered = !1, o.scheduleASAP(this)
        },
        stringInfo: function () {
          return "TileGridsGroupNode"
        },
        get cssBackgroundProperty() {
          return this.fullyRendered ? this.lastChild.cssBackgroundProperty : ""
        },
        handleEvent: function (t) {
          this.scheduleRefresh()
        },
        performScheduledUpdate: function () {
          if (this._canDraw()) {
            var t = this._map,
              e = t.camera,
              i = this.lastChild,
              o = !!i && i.debug !== this._map.debug,
              r = !!i && i.tileData.settings.showsDefaultTiles !== this._map.showsDefaultTiles;
            if (!this._tileDataAtZoomCompletion) {
              var l;
              if (Math.round(e.zoom) !== e.zoom && t.tileSettings.showsLabels) {
                if (!i) return;
                l = i.tileData
              } else l = new a(e, t.tileSettings);
              if (i) {
                if ((i.stale || !i.locked) && (!l.equals(i.tileData) || o || r)) {
                  var c = i.tileData;
                  c.tiles.forEach((function (t) {
                    l.tiles.indexOf(t) < 0 && t.unschedule()
                  }));
                  var d = l.settings.configuration === c.settings.configuration,
                    u = l.sameSettings(c) && l.resolution === c.resolution && !o;
                  if (d ? !u : l.sharesTileSourcesWithTileData(c)) i.locked = !0, this._addNewTileGridAnimated(l, !0);
                  else if (!i.locked) {
                    var p = d && this._children.length > 1;
                    delete i.stale, i.setTileDataAnimated(l, p);
                    var m = this._children[this._children.length - 2];
                    m && !l.sharesTileSourcesWithTileData(m.tileData) && (this._releaseChildren(!1), this._children = [i])
                  }
                }
              } else this._addNewTileGridAnimated(l, !1)
            }
            for (var g = e.zoom, _ = t.visibleMapRect, f = _.origin, y = _.size, v = 0, w = this.children, b = w.length; v < b; ++v) {
              var C = w[v],
                k = C.tileData,
                S = k.zoom,
                M = k.mapRect.origin,
                E = Math.pow(2, g - S),
                L = Math.pow(2, S) * (n.tileSize * E),
                T = M.x - f.x;
              if (T > y.width) T--;
              else {
                var x = k.mapRect.size.width;
                x > 0 && T + x < 0 && T++
              }
              C.scale = E, C.position = new s.Point(h.roundToDevicePixel(T * L), h.roundToDevicePixel((M.y - f.y) * L)), v < b - 1 && k.cancel()
            }
            this.fullyRendered = b > 0 && this.children[b - 1].fullyRendered
          }
        },
        cameraWillStartZooming: function (t) {
          if (this._canDraw()) {
            var e = this._map;
            t && (this._tileDataAtZoomCompletion = new a(t, e.tileSettings), this._tileDataAtZoomCompletion.load()), this.children.forEach((function (t) {
              t.locked = !0
            }))
          }
        },
        cameraDidStopZooming: function () {
          if (this._canDraw())
            if (this._tileDataAtZoomCompletion) this._addNewTileGridAnimated(this._tileDataAtZoomCompletion, !0, !0), delete this._tileDataAtZoomCompletion;
            else {
              var t = this._map,
                e = this.lastChild;
              if (e && t.camera.zoom === e.tileData.zoom) e.locked = !1;
              else {
                var i = new a(t.camera, t.tileSettings);
                this._addNewTileGridAnimated(i, !0, !0)
              }
            }
        },
        tileGridDidFinishRendering: function (t) {
          var e = this.children,
            i = e.length,
            n = e[i - 1];
          if (n.fullyRendered && !n.locked) {
            for (var o = 0; o < i - 1; ++o) e[o].tileData.releaseTiles();
            i > 1 && (this.children = [n]), this.fullyRendered = !0, this._map.tileGridDidFinishRendering()
          }
        },
        _canDraw: function () {
          var t = this._map;
          return t && !!t.configuration && !!t.language
        },
        _addNewTileGridAnimated: function (t, e, i) {
          var n = new r(this._map.debug),
            s = this.lastChild;
          s && !t.sharesTileSourcesWithTileData(s.tileData) ? (this._releaseChildren(!0), this.children = [n]) : this.addChild(n), n.setTileDataAnimated(t, e), i && o.scheduleASAP(this)
        },
        _releaseChildren: function (t) {
          for (var e = this.childCount - (t ? 1 : 2); e >= 0; --e) {
            var i = this.children[e].tileData;
            i.cancel(), i.releaseTiles()
          }
        }
      }), t.exports = c
    },
    5965: (t, e, i) => {
      var n = i(9328),
        o = i(6217),
        s = i(2114);

      function r(t) {
        n.ImageNode.call(this), this._tileSource = t._public, this._tileSource && "function" == typeof this._tileSource.addEventListener && this._tileSource.addEventListener(o.OPACITY_EVENT, this)
      }
      r.prototype = s.inheritPrototype(n.ImageNode, r, {
        handleEvent: function () {
          this._tileSource && (this.opacity = this._tileSource.opacity)
        },
        wasRemoved: function () {
          setTimeout(function () {
            this.parent && this.parent.scene || this._tileSource && "function" == typeof this._tileSource.removeEventListener && this._tileSource.removeEventListener(o.OPACITY_EVENT, this)
          }.bind(this), 0)
        }
      }), t.exports = r
    },
    7173: (t, e, i) => {
      var n = i(3658),
        o = i(8877),
        s = i(2114),
        r = {},
        a = [];

      function l(t, e, i, n, o, s, r, a, l, c, d) {
        this.x = t, this.y = e, this.z = i, this.tileSource = n, this.tint = o, this.emphasis = s, this.language = r, this.poi = a ? 1 : 0, this.labels = l ? 1 : 0, this.resolution = c, this._priority = d, this._loader = h(d, this), this._setLoaderCrossOriginMode()
      }

      function h(t, e) {
        var i;
        return a.length > 0 ? (i = a.shift()).reuse(t, e) : i = new o.ImageLoader(t, e), i
      }
      l.prototype = {
        constructor: l,
        get preferredOpacity() {
          return "number" == typeof this.tileSource.opacity ? this.tileSource.opacity : 1
        },
        get loaderState() {
          return this._loader ? this._loader.state : o.State.Unscheduled
        },
        schedule: function () {
          this._loader || (this._loader = h(this._priority, this), this._setLoaderCrossOriginMode()), this._loader.state > o.State.Unscheduled || this._loader.schedule()
        },
        unschedule: function () {
          this._loader && (this._loader.unschedule() && (a.push(this._loader), this._loader = null))
        },
        whenDoneLoading: function (t) {
          this._doneLoadingCallback = t
        },
        get urlForImageLoader() {
          var t = this.tileSource;
          if ("function" == typeof t.urlForImageLoader) return t.urlForImageLoader(this.x, this.y, this.z, this.resolution);
          var e = t.domains,
            i = t.proxyPrefixes,
            n = t.protocol,
            o = t.supportedResolutions[0],
            a = t.supportedResolutions[t.supportedResolutions.length - 1],
            l = s.clamp(this.resolution, o, a),
            h = 1;
          if ("satellite" === t.name) {
            var c = t.supportedSizes.length - 1,
              d = t.supportedSizes[0],
              u = t.supportedSizes[c];
            h = s.clamp(this.resolution, d, u)
          }
          var p = s.fillTemplate(t.path, {
            x: this.x,
            y: this.y,
            z: this.z,
            resolution: l,
            tileSizeIndex: h,
            lang: this.language,
            poi: this.poi
          });
          "satellite" !== t.name && (0 === this.labels ? p += "&labels=0&tint=" + this.tint + "&emphasis=" + this.emphasis : p += "&emphasis=" + this.emphasis + "&tint=" + this.tint);
          var m = r[p];
          if (m) return m;
          var g = Math.floor(76731.36742 * (this.x + this.y)) % e.length;
          (m = n + "//" + e[g] + p, i) && (m = i[g % i.length] + m);
          return r[p] = m, m
        },
        loaderDidSucceed: function (t) {
          this._loaderDidComplete()
        },
        loaderDidFail: function (t) {
          this._loaderDidComplete()
        },
        _setLoaderCrossOriginMode: function () {
          this.tileSource.crossOrigin && (this._loader.crossOrigin = n.getCorsAttribute(this.tileSource.withCredentials))
        },
        _loaderDidComplete: function () {
          this.image = this._loader.image, "function" == typeof this._doneLoadingCallback && (this._doneLoadingCallback(this), delete this._doneLoadingCallback)
        }
      }, t.exports = l
    },
    3769: (t, e, i) => {
      var n = i(8877),
        o = i(210),
        s = i(2114),
        r = i(8226),
        a = {};

      function l(t, e, i, n) {
        return n.settings.configuration.provider + n.settings.configuration.name + t + "-" + e + "-" + i + n.settings.tint + n.settings.emphasis + n.settings.language + n.settings.showsPOI + n.settings.showsLabels + n.settings.showsDefaultTiles + n.settings.showsTileInfo + n.resolution + n.settings.tileOverlays.map((function (n) {
          return n._impl.keyForTile(t, e, i)
        })).join("-")
      }

      function h(t) {
        var e = t.target;
        e.removeEventListener(r.Events.LoadSuccess, h), e.removeEventListener(r.Events.LoadFail, c)
      }

      function c(t) {
        var e = t.target;
        delete a[e.key], e.removeEventListener(r.Events.LoadSuccess, h), e.removeEventListener(r.Events.LoadFail, c)
      }
      t.exports = {
        tilesForTileData: function (t) {
          for (var e = t.range, i = e.min.z, d = Math.pow(2, i), u = e.min, p = e.denormalize().max, m = new o((u.x + p.x) / 2, (u.y + p.y) / 2), g = [], _ = Math.min(p.x, u.x + d - 1), f = u.x; f <= _; ++f)
            for (var y = u.y; y <= p.y; ++y) g.push(new o(f, y));
          return g.sort((function (t, e) {
            var i = t.distanceToPoint(m) - e.distanceToPoint(m);
            return 0 === i ? t.x - e.x == 0 ? t.y - e.y : t.x - e.x : i
          })), g.map((function (e) {
            return function (t, e, i, n, o) {
              var s = l(t, e, i, n),
                d = a[s];
              d ? d.schedule() : ((d = new r(s, t, e, i, n.settings, n.resolution, o)).addEventListener(r.Events.LoadSuccess, h), d.addEventListener(r.Events.LoadFail, c), a[s] = d, d._refCount = 0, d._loadTileImages());
              return d._refCount++, d
            }(s.mod(e.x, d), e.y, i, t, n.Priority.High)
          }))
        },
        releaseTile: function (t, e) {
          if (t._refCount--, 0 === t._refCount) {
            t.unschedule();
            var i = l(t.x, t.y, t.z, e);
            delete a[i]
          }
        }
      }
    },
    6217: (t, e, i) => {
      var n = i(2114),
        o = i(2466),
        s = i(6246),
        r = ["minimumZ", "maximumZ", "opacity", "data"];

      function a(t, e, i) {
        this._public = t, i = n.checkOptions(i), r.forEach((function (t) {
          t in i && (this[t] = i[t])
        }), this), Object.keys(i).forEach((function (t) {
          r.indexOf(t) < 0 && console.warn("[MapKit] Unknown option: " + t + ". Use the data property to store custom data.")
        })), this.urlTemplate = e, void 0 === this.opacity && (this.opacity = 1), this.stale = !1
      }
      a.RELOAD_EVENT = "tile-overlay-reload", a.OPACITY_EVENT = "tile-overlay-opacity-changed", a.ERROR_EVENT = "tile-error", a.prototype = {
        constructor: a,
        _minimumZ: null,
        _maximumZ: null,
        get urlTemplate() {
          return this._urlTemplate
        },
        set urlTemplate(t) {
          var e = typeof t;
          if ("function" !== e && "string" !== e) throw new TypeError("[MapKit] TileOverlay.urlTemplate expected a function or a string, but got `" + t + "` instead.");
          this._urlTemplate = t
        },
        keyForTile: function (t, e, i) {
          return this._minimumZ + "-" + this._maximumZ + "-" + this.urlForImageLoader(t, e, i, 1)
        },
        get minimumZ() {
          return this._minimumZ
        },
        get minZoomLevel() {
          return this._minimumZ
        },
        set minimumZ(t) {
          var e = "[MapKit] TileOverlay.minimumZ expected a number, but got `" + t + "` instead.";
          n.checkType(t, "number", e), this._minimumZ = Math.floor(t)
        },
        get maximumZ() {
          return this._maximumZ
        },
        get maxZoomLevel() {
          return this._maximumZ
        },
        set maximumZ(t) {
          var e = "[MapKit] TileOverlay.maximumZ expected a number, but got `" + t + "` instead.";
          n.checkType(t, "number", e), this._maximumZ = Math.ceil(t)
        },
        get opacity() {
          return this._opacity
        },
        set opacity(t) {
          var e = "[MapKit] TileOverlay.opacity expected a number, but got `" + t + "` instead.";
          n.checkType(t, "number", e), this._opacity = n.clamp(t, 0, 1);
          var i = new o.Event(a.OPACITY_EVENT);
          i.tileOverlay = this, i.opacity = this._opacity, this._public.dispatchEvent(i)
        },
        get data() {
          return Object.prototype.hasOwnProperty.call(this, "_data") || (this._data = {}), this._data
        },
        set data(t) {
          var e = "[MapKit] TileOverlay.data expected an Object, but got `" + t + "` instead.";
          n.checkType(t, "object", e), this._data = t
        },
        reload: function () {
          this.stale = !0;
          var t = new o.Event(a.RELOAD_EVENT);
          t.tileOverlay = this, this._public.dispatchEvent(t)
        },
        reloadComplete: function () {
          this.stale = !1
        },
        urlForImageLoader: function (t, e, i, o) {
          if (this._urlTemplate) {
            if ("function" == typeof this._urlTemplate) return s(this._urlTemplate, null, [t, e, i, o, this._data]);
            var r = this._urlTemplate.replace(/\{/g, "{{").replace(/\}/g, "}}"),
              a = {};
            return this._data && Object.keys(this._data).forEach((function (t) {
              a[t] = this._data[t]
            }), this), a.x = t, a.y = e, a.z = i, a.scale = o, n.fillTemplate(r, a)
          }
        },
        withCredentials: !1,
        crossOrigin: !1,
        dispatchErrorForURL: function (t) {
          var e = new o.Event(a.ERROR_EVENT);
          e.tileOverlay = this._public, e.tileUrl = t, this._public.dispatchEvent(e)
        }
      }, t.exports = a
    },
    6737: (t, e, i) => {
      var n = i(6217),
        o = i(2114),
        s = i(2466),
        r = i(1636);

      function a(t, e) {
        r(this, a) && Object.defineProperty(this, "_impl", {
          value: new n(this, t, e)
        })
      }
      a.prototype = o.inheritPrototype(s.EventTarget, a, {
        get urlTemplate() {
          return this._impl.urlTemplate
        },
        set urlTemplate(t) {
          this._impl.urlTemplate = t
        },
        get minimumZ() {
          return this._impl.minimumZ
        },
        set minimumZ(t) {
          this._impl.minimumZ = t
        },
        get maximumZ() {
          return this._impl.maximumZ
        },
        set maximumZ(t) {
          this._impl.maximumZ = t
        },
        get opacity() {
          return this._impl.opacity
        },
        set opacity(t) {
          this._impl.opacity = t
        },
        get data() {
          return this._impl.data
        },
        set data(t) {
          this._impl.data = t
        },
        reload: function () {
          this._impl.reload()
        }
      }), t.exports = a
    },
    1644: t => {
      function e(t, e) {
        this.min = t, this.max = e
      }
      e.prototype = {
        constructor: e,
        denormalize: function () {
          var t = this.min.copy(),
            i = this.max.copy();
          return i.x < t.x && (i.x += Math.pow(2, t.z)), new e(t, i)
        },
        toString: function () {
          return this.min.toString() + " -> " + this.max.toString()
        },
        equals: function (t) {
          var e = this.denormalize(),
            i = t.denormalize();
          return i.min.x === e.min.x && i.min.y === e.min.y && i.max.x === e.max.x && i.max.y === e.max.y && i.min.z === e.min.z && i.max.z === e.max.z
        }
      }, t.exports = e
    },
    8226: (t, e, i) => {
      var n = i(8877),
        o = i(2114),
        s = i(8961),
        r = i(7173);

      function a(t, e, i, n, o, s, r) {
        this.key = t, this.x = e, this.y = i, this.z = n, this.settings = o, this.resolution = s, this.priority = r, this.tileImages = []
      }
      a.Events = {
        LoadSuccess: "tile-load-success",
        LoadFail: "tile-load-fail"
      }, a.prototype = o.inheritPrototype(s.EventTarget, a, {
        loading: !1,
        loaded: !1,
        get tileSources() {
          return (this.settings.showsDefaultTiles ? this.settings.configuration.tileSources : []).concat(this.settings.tileOverlays.map((function (t) {
            return t._impl
          })).filter((function (t) {
            return !!t.urlForImageLoader(this.x, this.y, this.z, this.resolution)
          }), this)).filter((function (t) {
            return (this.z >= t.minZoomLevel || "number" != typeof t.minZoomLevel) && (this.z <= t.maxZoomLevel || "number" != typeof t.maxZoomLevel)
          }), this)
        },
        schedule: function () {
          this.loaded || (this.tileImages.forEach((function (t) {
            t.schedule()
          })), this.loading = !0)
        },
        unschedule: function () {
          this.tileImages.forEach((function (t) {
            t.unschedule()
          })), this.loading = !1
        },
        _loadTileImages: function () {
          if (!this.loading) {
            if (this.loaded) {
              if (!this._containsCanceledTileImages()) return;
              this.tileImages = [], this.loaded = !1
            }
            this.loading = !0;
            var t = this.tileSources;
            0 !== t.length ? (this._pendingTileImageLoads = t.length, t.forEach(this._loadTileImage, this)) : this._allTileImagesDoneLoading()
          }
        },
        _loadTileImage: function (t) {
          var e = this.settings,
            i = new r(this.x, this.y, this.z, t, e.tint, e.emphasis, e.language, e.showsPOI, e.showsLabels, this.resolution, this.priority);
          i.schedule(), this.tileImages.push(i), i.whenDoneLoading(this._tileImageDoneLoading.bind(this, t))
        },
        _requestTileImageLoadStatus: function (t, e) {
          var i = o.xhr(e, t.image.src);
          i.open("GET", t.image.src, !0), i.send()
        },
        _tileImageDoneLoading: function (t, e) {
          if (e._loader.state === n.State.Failed)
            if ("function" == typeof t.dispatchErrorForURL) t.dispatchErrorForURL(e._loader.url);
            else {
              var i = new s.Event(a.Events.LoadFail);
              i.tileImage = e, this.dispatchEvent(i)
            } this._pendingTileImageLoads--, 0 === this._pendingTileImageLoads && this._allTileImagesDoneLoading()
        },
        _allTileImagesDoneLoading: function () {
          delete this._pendingTileImageLoads, this.loading = !1, this.loaded = !0, this._containsCanceledTileImages() || this.dispatchEvent(new s.Event(a.Events.LoadSuccess))
        },
        _containsCanceledTileImages: function () {
          return this.tileImages.some((function (t) {
            return t.loaderState === n.State.Canceled
          }))
        }
      }), t.exports = a
    },
    7046: (t, e, i) => {
      var n = i(9601),
        o = i(4902),
        s = i(2114),
        r = i(4937),
        a = i(210),
        l = i(7090),
        h = i(5524),
        c = i(975),
        d = i(8006),
        u = i(2993),
        p = Math.pow(1e-4, 2.5);

      function m(t) {
        l.call(this, t), this._pinchRecognizer = this.addRecognizer(new o.Pinch), this._pinchRecognizer.scaleThreshold = .1, this._doubleTapWithOneFingerRecognizer = this.addRecognizer(new o.Tap), this._doubleTapWithOneFingerRecognizer.numberOfTouchesRequired = 1, this._doubleTapWithOneFingerRecognizer.numberOfTapsRequired = 2, this._singleTapWithTwoFingersRecognizer = this.addRecognizer(new o.Tap), this._singleTapWithTwoFingersRecognizer.numberOfTouchesRequired = 2, this._singleTapWithTwoFingersRecognizer.numberOfTapsRequired = 1, this.map.node.element.addEventListener("wheel", this)
      }

      function g(t) {
        return t.state === o.States.Began || t.state === o.States.Changed
      }
      m.prototype = s.inheritPrototype(l, m, {
        decelerating: !1,
        stopDecelerating: function () {
          this.decelerating && this._decelerationEnded()
        },
        destroy: function () {
          l.prototype.destroy.call(this), this._integralZoomController && (this._integralZoomController.destroy(), delete this._integralZoomController), clearTimeout(this._wheelEndTimeoutId), delete this._pinchRecognizer, delete this._doubleTapWithOneFingerRecognizer, delete this._singleTapWithTwoFingersRecognizer, this.map.node.element.removeEventListener("wheel", this), this.stopDecelerating()
        },
        get active() {
          return g(this._pinchRecognizer) || g(this._doubleTapWithOneFingerRecognizer) || g(this._singleTapWithTwoFingersRecognizer)
        },
        handleEvent: function (t) {
          if ("wheel" !== t.type) {
            var e = t.target;
            switch (e) {
              case this._pinchRecognizer:
                this._handlePinchChange(e);
                break;
              case this._doubleTapWithOneFingerRecognizer:
                this._handleDoubleTapWithOneFingerChange(e);
                break;
              case this._singleTapWithTwoFingersRecognizer:
                this._handleSingleTapWithTwoFingersChange(e)
            }
          } else this._handleWheelEvent(t)
        },
        performScheduledUpdate: function () {
          if (this.decelerating) {
            var t = this.map,
              e = Date.now() - this._startTime;
            if (e >= this._decelerationDuration) return t.scaleCameraAroundMapPoint(this._adjustedScaleAtDecelerationEnd / this._scale, this._lastScaleCenter), void this._decelerationEnded();
            var i = this._scaleAtTime(e),
              n = (i - this._initialScale) / (this._scaleAtDecelerationEnd - this._initialScale);
            i += this._scaleAdjustment * n, t.scaleCameraAroundMapPoint(i / this._scale, this._lastScaleCenter);
            var o = t.camera.zoom;
            o === t.currentMinZoomLevel || o === this.currentMaxZoomLevel ? this.stopDecelerating() : (this._scale = i, this._schedule())
          }
        },
        _centerWithRecognizer: function (t) {
          return this._mapPointFromCentroid(t.locationInElement())
        },
        _mapPointFromCentroid: function (t) {
          var e = this.map,
            i = e.node.convertPointFromPage(t);
          i = e.camera.transformGestureCenter(i);
          var o = e.visibleMapRect,
            s = e.camera.viewportSize;
          return new n.MapPoint(o.minX() + i.x / s.width * o.size.width, o.minY() + i.y / s.height * o.size.height)
        },
        _handlePinchChange: function (t) {
          var e = this.map,
            i = e.camera,
            n = i.zoom;
          if (t.state === o.States.Began) this._singleTapWithTwoFingersRecognizer.enabled = !1, e.cameraWillStartZooming(c.ZoomTypes.Pinch);
          else if (t.state === o.States.Ended || t.state === o.States.Changed) {
            var r = t.scale;
            this._lastScaleCenter = this.centerForGesture(t), (r > 1 && n !== e.currentMaxZoomLevel || r < 1 && n !== e.currentMinZoomLevel) && (e.scaleCameraAroundMapPoint(r, this._lastScaleCenter), t.scale = 1)
          }
          if ((t.state === o.States.Ended || t.state === o.States.Failed) && (this._singleTapWithTwoFingersRecognizer.enabled = !0, this._startDeceleratingWithVelocity(t.velocity), !this.decelerating)) {
            var a = e.snapsToIntegralZoomLevels ? Math.round(n) : n,
              l = s.clamp(a, e.currentMinZoomLevel, e.currentMaxZoomLevel);
            n === l ? e.cameraDidStopZooming() : this._lastScaleCenter ? e.scaleCameraAroundMapPoint(Math.pow(2, l - n), this._lastScaleCenter, !0) : e.setCameraAnimated(new h(i.center, l, i.viewportSize, i.rotation), !0)
          }
        },
        _handleDoubleTapWithOneFingerChange: function (t) {
          t.state === o.States.Recognized && this._zoomWithTapRecognizer(t, t.modifierKeys.alt)
        },
        _handleSingleTapWithTwoFingersChange: function (t) {
          t.state === o.States.Recognized && this._zoomWithTapRecognizer(t, !0)
        },
        _handleWheelEvent: function (t) {
          if (t.ctrlKey || t.shiftKey || this.map.allowWheelToZoom) {
            t.preventDefault();
            var e = t.shiftKey && !!t.deltaX && !t.deltaY,
              i = e ? t.deltaX : t.deltaY;
            switch (t.deltaMode) {
              case t.DOM_DELTA_LINE:
                i *= 100 / 3 * window.devicePixelRatio;
                break;
              case t.DOM_DELTA_PAGE:
                i *= 100 * window.devicePixelRatio
            }(t.ctrlKey || this.map.allowWheelToZoom && !t.shiftKey || e) && (i *= -1), t.ctrlKey && t.deltaMode === t.DOM_DELTA_PIXEL && (i *= 10);
            var n = 1 + (i > 0 ? Math.sqrt(i) : -Math.sqrt(-i)) * d.WheelZoomFactor,
              o = this.map;
            if (!(n > 1 && o.camera.zoom === o.currentMaxZoomLevel || n < 1 && o.camera.zoom === o.currentMinZoomLevel)) {
              var s = new a(t.pageX, t.pageY);
              this._lastScaleCenter = o.staysCenteredDuringZoom ? o.transformCenter : this._mapPointFromCentroid(s), o.snapsToIntegralZoomLevels ? this._wheelZoomToScaleAndIntegralZoomLevel(n) : this._wheelZoomToScale(n)
            }
          }
        },
        _wheelZoomToScale: function (t) {
          var e = this.map;
          this._wheelZooming || (e.cameraWillStartZooming(c.ZoomTypes.Scroll), this._wheelZooming = !0), e.scaleCameraAroundMapPoint(t, this._lastScaleCenter), this._wheelEndTimeoutId && (clearTimeout(this._wheelEndTimeoutId), this._wheelEndTimeoutId = null), this._wheelEndTimeoutId = setTimeout(function () {
            this._wheelEndTimeoutId = null, this._wheelZooming = !1, e.cameraDidStopZooming()
          }.bind(this), d.WheelEventTimeout)
        },
        _wheelZoomToScaleAndIntegralZoomLevel: function (t) {
          this._integralZoomController || (this._integralZoomController = new u(this.map)), this._integralZoomController.zoomToScale(t, this._lastScaleCenter)
        },
        _zoomWithTapRecognizer: function (t, e) {
          var i = this.map,
            n = i.camera.zoom,
            o = e ? -1 : 1,
            r = (e ? Math.floor(n + .5) : Math.ceil(n - .5)) + o,
            a = n - s.clamp(r, i.currentMinZoomLevel, i.currentMaxZoomLevel);
          Math.abs(a) < .5 || !i.cameraWillStartZooming(c.ZoomTypes.DoubleTap, !0, !0) || i.setCameraAnimated(i.camera.withNewMapRect(i.visibleMapRect.scale(Math.pow(2, a), this.centerForGesture(t))), !0)
        },
        _startDeceleratingWithVelocity: function (t) {
          Math.abs(t) < 1 || (this.decelerating = !0, this._startTime = Date.now(), this._initialScale = this._scale = 1, this._initialVelocity = t / 1e3, this._decelerationFactor = .98875, this._decelerationDuration = Math.log(p / Math.pow(this._initialVelocity, 2)) / (2 * Math.log(this._decelerationFactor)), this._scaleAtDecelerationEnd = this._scaleAtTime(this._decelerationDuration), this._adjustedScaleAtDecelerationEnd = this._adjustScaleAtDecelerationEnd(this._scaleAtDecelerationEnd / this._scale), this._scaleAdjustment = this._adjustedScaleAtDecelerationEnd - this._scaleAtDecelerationEnd, this._schedule())
        },
        _adjustScaleAtDecelerationEnd: function (t) {
          var e = this.map,
            i = e.camera.zoom,
            n = i + s.log2(t);
          if (e.snapsToIntegralZoomLevels) {
            var o = Math.round(n);
            n > i && o <= i ? o = Math.ceil(n) : n < i && o >= i && (o = Math.floor(n)), n = o
          }
          var r = s.clamp(n, e.currentMinZoomLevel, e.currentMaxZoomLevel);
          return Math.pow(2, r - i)
        },
        _schedule: function () {
          r.scheduleOnNextFrame(this)
        },
        _scaleAtTime: function (t) {
          return Math.max(this._initialScale + this._decelerationFactor * this._initialVelocity * (Math.pow(this._decelerationFactor, t) - 1) / (this._decelerationFactor - 1), 0)
        },
        _decelerationEnded: function () {
          this.decelerating = !1;
          var t = this.map;
          if (t.snapsToIntegralZoomLevels) {
            var e = t.camera,
              i = t.snapsToIntegralZoomLevels ? Math.round(e.zoom) : e.zoom;
            t.setCameraAnimated(new h(e.center, i, e.viewportSize, e.rotation))
          }
          t.cameraDidStopZooming()
        }
      }), t.exports = m
    },
    6367: (t, e, i) => {
      t.exports = i(1248)
    },
    6992: (t, e, i) => {
      "use strict";
      var n = i(4937),
        o = i(3658),
        s = i(2114);

      function r(t, e) {
        if (!e) return this._targetOpacity = t, void (this.opacity = t);
        t !== this._targetOpacity && (t !== this.opacity ? (this._targetOpacity = t, this._startTime = Date.now(), this._startOpacity = this._opacity, n.scheduleOnNextFrame(this)) : this._targetOpacity = t)
      }

      function a() {
        if ("function" == typeof this.constructor.prototype.performScheduledUpdate && this.constructor.prototype.performScheduledUpdate.call(this), null !== this._targetOpacity) {
          if (this._targetOpacity === this.opacity) return this._startTime = null, this._startOpacity = null, void (this._targetOpacity = null);
          var t = Date.now() - this._startTime,
            e = this._targetOpacity - this._startOpacity,
            i = Math.abs(e * this._totalDurationMs),
            r = Math.min(t / i, 1),
            a = o.easeInOut(r) * e + this._startOpacity;
          this.opacity = s.clamp(a, 0, 1), n.scheduleOnNextFrame(this)
        }
      }
      t.exports = function (t, e) {
        return t._targetOpacity = null, t._startOpacity = null, t._startTime = null, t._totalDurationMs = e || 300, t.setOpacityAnimated = r, t.performScheduledUpdate = a, t
      }
    },
    8182: (t, e, i) => {
      "use strict";
      var n = i(5708),
        o = i(9328),
        s = i(2114);

      function r() {
        o.BaseNode.call(this), this._legend = null, this._segmentWidth = 0, this._segmentStart = 0, this._numberOfSegments = 0, this._fillColor = null, this._strokeColor = null, this._renderer = new n(this)
      }
      r.prototype = s.inheritPrototype(o.BaseNode, r, {
        get legend() {
          return this._legend
        },
        set legend(t) {
          this._legend = t, this.needsDisplay = !0
        },
        get segmentStart() {
          return this._segmentStart
        },
        set segmentStart(t) {
          this._segmentStart = t, this.needsDisplay = !0
        },
        get segmentWidth() {
          return this._segmentWidth
        },
        set segmentWidth(t) {
          this._segmentWidth = t, this.needsDisplay = !0
        },
        get numberOfSegments() {
          return this._numberOfSegments
        },
        set numberOfSegments(t) {
          this._numberOfSegments = t, this.needsDisplay = !0
        },
        get fillColor() {
          return this._fillColor
        },
        set fillColor(t) {
          this._fillColor = t, this.needsDisplay = !0
        },
        get strokeColor() {
          return this._strokeColor
        },
        set strokeColor(t) {
          this._strokeColor = t, this.needsDisplay = !0
        },
        stringInfo: function () {
          var t = "~" + this.fillColor + "/" + this.strokeColor + "~ ";
          return this._legend ? "LegendNode<labels:[" + this._legend.labels.slice(0, this.numberOfSegments + 1).join(", ") + "], unit:" + this._legend.unit + ")> " + t : "LegendNode " + t
        },
        measureTextOverflow: function (t, e) {
          return this._renderer.measureTextOverflow(t, e)
        }
      }), t.exports = r
    },
    646: (t, e, i) => {
      "use strict";
      var n = i(6992),
        o = i(6930),
        s = i(1492),
        r = i(2114);

      function a() {
        s.call(this), n(this, o.InnerTransitionDuration), this.lineWidth = o.OutlineWidth
      }
      a.prototype = r.inheritPrototype(s, a, {
        stringInfo: function () {
          return "OutlineNode " + ("~" + this.strokeColor + "~ ")
        }
      }), t.exports = a
    },
    1492: (t, e, i) => {
      "use strict";
      var n = i(8901),
        o = i(9328),
        s = i(2114);

      function r() {
        o.BaseNode.call(this), this._fillColor = null, this._strokeColor = null, this._lineWidth = null, this._innerStroke = !1, this._renderer = new n(this)
      }
      r.prototype = s.inheritPrototype(o.BaseNode, r, {
        get fillColor() {
          return this._fillColor
        },
        set fillColor(t) {
          this._fillColor = t, this.needsDisplay = !0
        },
        get strokeColor() {
          return this._strokeColor
        },
        set strokeColor(t) {
          this._strokeColor = t, this.needsDisplay = !0
        },
        get innerStroke() {
          return this._innerStroke
        },
        set innerStroke(t) {
          this._innerStroke = t, this.needsDisplay = !0
        },
        get lineWidth() {
          return this._lineWidth
        },
        set lineWidth(t) {
          this._lineWidth = t, this.needsDisplay = !0
        }
      }), t.exports = r
    },
    5708: (t, e, i) => {
      "use strict";
      var n = i(6930),
        o = i(9328),
        s = i(2114);

      function r(t) {
        o.RenderItem.call(this, t)
      }
      r.prototype = s.inheritPrototype(o.RenderItem, r, {
        measureTextOverflow: function (t, e) {
          var i, o = this._node;
          return o.legend ? (t.font = n.LegendFont, i = e ? o.legend.labels[0] : o.legend.labels[o.numberOfSegments], t.measureText(i).width / 2 + (e ? 0 : t.measureText(" " + o.legend.unit).width)) : 0
        },
        draw: function (t) {
          var e = this._node;
          if (e.legend) {
            t.font = n.LegendFont, t.textAlign = "center", t.textBaseline = "bottom", t.lineWidth = n.LegendOuterStrokeWidth, t.fillStyle = e.fillColor, t.strokeStyle = e.strokeColor;
            for (var i = e.size.height - n.LegendMarginBottom - n.LegendSpacing, o = e.segmentStart, s = 0; s <= e.numberOfSegments; s++) {
              var r = e.legend.labels[s];
              t.strokeText(r, o, i), t.fillText(r, o, i), s === e.numberOfSegments ? o += t.measureText(r).width / 2 : o += e.segmentWidth
            }
            var a = " " + e.legend.unit;
            t.textAlign = "left", t.strokeText(a, o, i), t.fillText(a, o, i)
          }
        }
      }), t.exports = r
    },
    8901: (t, e, i) => {
      "use strict";
      var n = i(9328),
        o = i(2114),
        s = i(3658);

      function r(t) {
        n.RenderItem.call(this, t)
      }
      r.prototype = o.inheritPrototype(n.RenderItem, r, {
        draw: function (t) {
          var e = this._node,
            i = e.fillColor,
            n = e.strokeColor,
            o = e.lineWidth;
          i && (t.fillStyle = i, t.fillRect(0, 0, e.size.width, e.size.height)), n && o && (o >= 1 || s.devicePixelRatio > 1) && (t.lineWidth = o, t.strokeStyle = n, e.innerStroke ? t.strokeRect(o / 2, o / 2, e.size.width - o, e.size.height - o) : t.strokeRect(-o / 2, -o / 2, e.size.width + o, e.size.height + o))
        }
      }), t.exports = r
    },
    6930: t => {
      "use strict";
      t.exports = {
        GlobalFadeDuration: 700,
        InnerTransitionDuration: 200,
        MinimumNumberOfSegments: 2,
        MaximumNumberOfSegments: 5,
        MagicNumbers: [1.25, 2.5, 5],
        FirstMagicExponent: -3,
        LastMagicExponent: 7,
        MaximumNumberOfDisplayedSegments: 3,
        SegmentThickness: 3,
        LegendHorizontalMargin: 6,
        LegendMarginBottom: 8,
        LegendSpacing: 1,
        OutlineWidth: 1,
        LightSegmentColorRegular: "rgba(255, 255, 255, 0.7)",
        DarkSegmentColorRegular: "rgba(0, 0, 0, 0.73)",
        OutlineColorRegular: "rgba(255, 255, 255, 0.5)",
        LightSegmentColorSatellite: "rgba(255, 255, 255, 0.8)",
        DarkSegmentColorSatellite: "rgba(178, 178, 178, 0.8)",
        OutlineColorSatellite: "rgba(0, 0, 0, 1)",
        SegmentInnerStrokeColor: "rgba(0, 0, 0, 0.2)",
        SegmentInnerStrokeWidth: .5,
        LegendFont: "9px '-apple-system-font', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'",
        LegendColorRegular: "rgba(72, 69, 65, 1)",
        LegendOuterStrokeColorRegular: "rgba(255, 255, 255, 0.5)",
        LegendColorSatellite: "rgba(255, 255, 255, 1)",
        LegendOuterStrokeColorSatellite: "rgba(0, 0, 0, 1)",
        LegendOuterStrokeWidth: 1,
        MetersThreshold: 500,
        FeetThreshold: .25,
        MilesToMeters: 1609.344,
        MetersToMiles: 1 / 1609.344,
        MilesToFeet: 5280
      }
    },
    1248: (t, e, i) => {
      "use strict";
      var n = i(6992),
        o = i(6930),
        s = i(8182),
        r = i(646),
        a = i(1593),
        l = i(4937),
        h = i(9328),
        c = i(9651),
        d = i(2114);

      function u() {
        h.GroupNode.call(this), this._needsLayout = !1, this._layoutCanvas = document.createElement("canvas"), this._layoutContext = this._layoutCanvas.getContext("2d"), this._distance = 0, this._mapWidth = 0, this._theme = u.Themes.light, this._leftAligned = !1, this._l10n = null, this._segmentWidth = 0, this._oldNumberOfSegments = 0, this._legend = {
          labels: [],
          unit: ""
        }, this._legendNode = this.addChild(new s), this._outlineNodes = [0, 1].map((function () {
          return this.addChild(new r)
        }), this), this._activeOutlineNode = this._outlineNodes[0], this._outlineNodes[1].opacity = 0, this._segmentNodes = [0, 1, 2].map((function (t) {
          return this.addChild(new c)
        }), this), this._updateColors(), n(this, o.GlobalFadeDuration)
      }
      u.Themes = {
        light: "Light",
        dark: "Dark"
      }, u.prototype = d.inheritPrototype(h.GroupNode, u, {
        get layerBounds() {
          return new a(0, 0, this.size.width, Math.max(this.size.height, 48))
        },
        get distance() {
          return this._distance
        },
        set distance(t) {
          Math.abs(t - this._distance) / this._distance < .01 || (this._distance = t, this._computeSegments())
        },
        get mapWidth() {
          return this._mapWidth
        },
        set mapWidth(t) {
          t !== this._mapWidth && (this._mapWidth = t, this._computeSegments())
        },
        get theme() {
          return this._theme
        },
        set theme(t) {
          this._theme = t, this._updateColors()
        },
        get l10n() {
          return this._l10n
        },
        set l10n(t) {
          this._l10n && this._l10n.removeEventListener(this._l10n.Events.LocaleChanged, this), this._l10n = t, t && t.addEventListener(t.Events.LocaleChanged, this)
        },
        get useMetric() {
          return this._useMetric
        },
        set useMetric(t) {
          this._useMetric !== t && (this._useMetric = t, this._computeSegments())
        },
        get leftAligned() {
          return this._leftAligned
        },
        set leftAligned(t) {
          this._leftAligned = t, this.needsLayout = !0
        },
        stringInfo: function () {
          return "ScaleNode<distance:" + Math.round(100 * this.distance) / 100 + "m>"
        },
        get needsLayout() {
          return this._needsLayout
        },
        set needsLayout(t) {
          this._needsLayout !== t && (this._needsLayout = t, t && l.scheduleASAP(this))
        },
        performScheduledUpdate: function () {
          this.needsLayout && (this.layoutSubNodes(), this.needsLayout = !1)
        },
        layoutSubNodes: function () {
          for (var t = this._computeSegmentsRects(), e = 0; e < o.MaximumNumberOfDisplayedSegments; e++) {
            var i = t[this.leftAligned ? e : t.length - 1 - e],
              n = this._segmentNodes[e];
            i ? (n.position = i.origin, n.size = i.size, n.setOpacityAnimated(1, !0)) : n.setOpacityAnimated(0, !0)
          }
          var s = a.unionOfRects(t).round();
          if (t.length !== this._oldNumberOfSegments) {
            this._activeOutlineNode.setOpacityAnimated(0, !0);
            var r = 0 === this._outlineNodes.indexOf(this._activeOutlineNode) ? 1 : 0;
            this._activeOutlineNode = this._outlineNodes[r], this._activeOutlineNode.setOpacityAnimated(1, !0)
          }
          this._activeOutlineNode.position = s.origin, this._activeOutlineNode.size = s.size;
          var l = t[0];
          this._legendNode.segmentStart = l.origin.x, this._legendNode.segmentWidth = l.size.width, this._legendNode.size.width = this.size.width, this._legendNode.size.height = this.size.height, this._oldNumberOfSegments = t.length
        },
        handleEvent: function (t) {
          this._computeSegments()
        },
        _updateColors: function (t) {
          var e = this.theme === u.Themes.dark;
          this._legendNode.fillColor = e ? o.LegendColorSatellite : o.LegendColorRegular, this._legendNode.strokeColor = e ? o.LegendOuterStrokeColorSatellite : o.LegendOuterStrokeColorRegular;
          var i = e ? [o.LightSegmentColorSatellite, o.DarkSegmentColorSatellite] : [o.DarkSegmentColorRegular, o.LightSegmentColorRegular];
          this._segmentNodes.forEach((function (t, n) {
            t.fillColor = i[n % 2], t.strokeColor = e ? null : o.SegmentInnerStrokeColor
          }), this);
          var n = e ? o.OutlineColorSatellite : o.OutlineColorRegular;
          this._outlineNodes.forEach((function (t) {
            t.strokeColor = n
          }))
        },
        _computeSegments: function () {
          if (0 !== this.size.width && 0 !== this.mapWidth && this._l10n) {
            var t, e = this.size.width,
              i = this.mapWidth,
              n = this.distance * e / i,
              s = !this._useMetric,
              r = !1,
              a = 1;
            s && (n *= o.MetersToMiles) < o.FeetThreshold && (r = !0, n *= o.MilesToFeet);
            for (var l = o.FirstMagicExponent, h = !1; !h && l < o.LastMagicExponent; l++) h = o.MagicNumbers.some(d);
            this._segmentWidth = a ? e / a : 0;
            var c = t;
            s && (r && (t /= o.MilesToFeet), t *= o.MilesToMeters), this._computeLegend(t, c, r)
          }

          function d(e) {
            return t = e * Math.pow(10, l), (a = n / t) >= o.MinimumNumberOfSegments && a < o.MaximumNumberOfSegments
          }
        },
        _computeLegend: function (t, e, i) {
          var n = 0;
          this._useMetric ? t > o.MetersThreshold ? (this._legend.unit = this._l10n.get("Scale.Kilometer.Short"), n = t / 1e3) : (this._legend.unit = this._l10n.get("Scale.Meter.Short"), n = t) : (this._legend.unit = i ? this._l10n.get("Scale.Feet.Short") : this._l10n.get("Scale.Mile.Short"), n = e);
          for (var s = [], r = 0; r < o.MaximumNumberOfSegments; r++) {
            var a = r * n;
            s.push(a.toString())
          }
          this._legend.labels = s, this._legendNode.legend = this._legend, this.needsLayout = !0
        },
        _computeSegmentsRects: function () {
          for (var t = this._layoutContext, e = 0, i = o.LegendHorizontalMargin + this._legendNode.measureTextOverflow(t, !0), n = this.size.height - o.LegendMarginBottom + o.LegendSpacing, s = this._segmentWidth, r = [], l = 0; l < o.MaximumNumberOfDisplayedSegments; l++) {
            var h = new a(i, n, s, o.SegmentThickness).round();
            if (r.push(h), i = h.origin.x + h.size.width, this._legendNode.numberOfSegments = r.length, i + s + (e = this._legendNode.measureTextOverflow(t)) + o.LegendHorizontalMargin > this.size.width) break
          }
          0 === this._oldNumberOfSegments && (this._oldNumberOfSegments = r.length);
          var c = 0;
          return this.leftAligned || (c = Math.round(this.size.width - i - e - o.LegendHorizontalMargin), r.forEach((function (t) {
            t.origin.x += c
          }))), r
        }
      }), t.exports = u
    },
    9651: (t, e, i) => {
      "use strict";
      var n = i(6992),
        o = i(6930),
        s = i(1492),
        r = i(2114);

      function a() {
        s.call(this), n(this, o.InnerTransitionDuration), this.lineWidth = o.SegmentInnerStrokeWidth, this.innerStroke = !0
      }
      a.prototype = r.inheritPrototype(s, a, {
        stringInfo: function () {
          return "SegmentNode " + ("~" + this.fillColor + "~ ")
        }
      }), t.exports = a
    },
    9328: (t, e, i) => {
      t.exports = {
        Scene: i(3931),
        BaseNode: i(5989),
        GroupNode: i(1796),
        ImageNode: i(5190),
        RenderItem: i(69),
        NodeAnimator: i(9985),
        Size: i(4140),
        Point: i(210),
        Matrix: i(311)
      }
    },
    2004: (t, e, i) => {
      var n = i(4937),
        o = [];

      function s() {
        var t = o;
        o = [];
        for (var e = [], i = 0, n = t.length; i < n; ++i) {
          var s = t[i].scene;
          s && r(e, s) && s.renderer.update()
        }
      }

      function r(t, e) {
        return -1 === t.indexOf(e) && (t.push(e), !0)
      }
      t.exports = {
        scheduleNode: function (t) {
          r(o, t) && 1 === o.length && n.scheduleDraw(s)
        }
      }
    },
    5989: (t, e, i) => {
      var n = i(4140),
        o = i(210),
        s = i(1593),
        r = i(311),
        a = i(2936),
        l = i(2004),
        h = (new r).toString();

      function c() {
        this._parent = null, this._children = [], this._renderer = null, this._opacity = 1, this._size = new n, this._position = new o, this._transform = new r, this._frozen = !1, this._keyForFrozenLayer = "", this._wantsLayerBacking = !1
      }

      function d(t) {
        t._parent = null;
        for (var e = [t]; e.length > 0;) {
          var i = e.pop();
          i.wasRemoved(), i._renderer && "function" == typeof i._renderer.nodeWasRemoved && i._renderer.nodeWasRemoved(), Array.prototype.push.apply(e, i.children)
        }
      }

      function u(t) {
        for (var e = null, i = 0, n = 0; t && !e;) {
          var o = t.transform.transformPoint(t.position);
          i -= o.x, n -= o.y, e = (t = t.parent).element
        }
        return {
          element: e,
          offsetX: i,
          offsetY: n
        }
      }

      function p(t, e, i, n, o) {
        var s = "";
        if (s += e, o && (s += function (t) {
          return t < 0 ? "" : t + ":"
        }(i)), s += t.toString(), s += function (t) {
          return t.childCount < 1 ? "" : " ⤵︎ " + t.childCount
        }(t), t.extraInfo && "function" == typeof t.extraInfo && t.extraInfo().forEach((function (t) {
          s += "\n" + e + "| " + t
        })), 0 === n) return s;
        for (var r = t.children, a = 0, l = r.length; a < l; ++a) {
          var h = t.childCount < 1 ? -1 : a;
          s += "\n", s += p(r[a], e + "    ", h, n - 1, o)
        }
        return s
      }
      c.prototype = {
        constructor: c,
        get scene() {
          for (var t = i(3931), e = this; e; e = e._parent)
            if (e instanceof t) return e
        },
        get renderer() {
          return this._renderer
        },
        get wantsLayerBacking() {
          return !!this.keyForFrozenLayer || this._frozen || this._wantsLayerBacking || this._needsLayerBacking()
        },
        set wantsLayerBacking(t) {
          t !== this._wantsLayerBacking && (this._wantsLayerBacking = t, this.needsDisplay = !0)
        },
        get frozen() {
          return !!this.keyForFrozenLayer || this._frozen
        },
        set frozen(t) {
          t !== this._frozen && (this._frozen = t, this.needsDisplay = !0)
        },
        get keyForFrozenLayer() {
          return this._keyForFrozenLayer
        },
        set keyForFrozenLayer(t) {
          t !== this._keyForFrozenLayer && (this._keyForFrozenLayer = t, this.needsDisplay = !0)
        },
        get opacity() {
          return this._opacity
        },
        set opacity(t) {
          (t = Math.min(Math.max(0, t), 1)) !== this._opacity && (this._opacity = t, this.needsDisplay = !0)
        },
        get position() {
          return this._position
        },
        set position(t) {
          t.equals(this._position) || (this._position = t.copy(), this.needsDisplay = !0)
        },
        get transform() {
          return this._transform
        },
        set transform(t) {
          this._transform = t, this.needsDisplay = !0
        },
        get size() {
          return this._size
        },
        set size(t) {
          this._size = t || new n, this.needsDisplay = !0
        },
        get bounds() {
          return new s(this._position.x, this._position.y, this.size.width, this.size.height)
        },
        get layerBounds() {
          for (var t = new s(0, 0, this.size.width, this.size.height), e = this._children, i = 0, n = e.length; i < n; ++i) {
            var r = e[i],
              a = r.layerBounds;
            a.origin.x += r._position.x, a.origin.y += r._position.y;
            for (var l = r.transform, h = [l.transformPoint(new o(a.minX(), a.minY())), l.transformPoint(new o(a.maxX(), a.minY())), l.transformPoint(new o(a.maxX(), a.maxY())), l.transformPoint(new o(a.minX(), a.maxY()))], c = h[0].x, d = h[0].y, u = h[0].x, p = h[0].y, m = 1; m < h.length; ++m) {
              var g = h[m];
              g.x < c && (c = g.x), g.x > u && (u = g.x), g.y < d && (d = g.y), g.y > p && (p = g.y)
            }
            t = t.unionWithRect(new s(c, d, u - c, p - d))
          }
          return t
        },
        set needsDisplay(t) {
          t && l.scheduleNode(this)
        },
        get parent() {
          return this._parent
        },
        get children() {
          return this._children
        },
        set children(t) {
          for (var e = 0, i = 0, n = [].concat(this._children); e < t.length;) n[i] !== t[e] ? n[i] && -1 === t.indexOf(n[i]) ? (this.removeChild(n[i]), i++) : (t[e]._parent === this && n.splice(n.indexOf(t[e]), 1), this.addChild(t[e], e), e++) : (e++, i++);
          for (; i < n.length;) this.removeChild(n[i]), i++
        },
        get childCount() {
          return this._children.length
        },
        get firstChild() {
          return this._children[0] || null
        },
        get lastChild() {
          return this._children[this._children.length - 1] || null
        },
        get previousSibling() {
          if (!this._parent) return null;
          var t = this._parent._children,
            e = t.indexOf(this);
          return e > 0 ? t[e - 1] : null
        },
        get nextSibling() {
          if (!this._parent) return null;
          var t = this._parent._children,
            e = t.indexOf(this);
          return -1 !== e && e < t.length - 1 ? t[e + 1] : null
        },
        toString: function () {
          var t = "";
          return this.element && (t += "🏷 "), this.wantsLayerBacking && (t += "🏁 "), this.frozen && (t += "❄️ ", this.keyForFrozenLayer && (t += "<" + this.keyForFrozenLayer + ">")), this.stringInfo && "function" == typeof this.stringInfo ? t += this.stringInfo() : t += "UnknownNode", 0 === this.position.x && 0 === this.position.y || (t += " (" + this.position.x + ", " + this.position.y + ")"), "number" == typeof this.repeatOffset && (t += (this.repeatOffset > 0 ? "+" : "") + this.repeatOffset + " "), 0 === this.size.width && 0 === this.size.height || (t += " " + this.size.width + "x" + this.size.height), 1 !== this.opacity && (t += " [opacity:" + this.opacity + "]"), this.transform.toString() !== h && (t += " [" + this.transform.toString() + "]"), this.animators && this.animators.forEach((function (e) {
            t += " " + e.stringInfo()
          })), t
        },
        dump: function (t, e) {
          return void 0 === t && (t = 1 / 0), p(this, "", -1, t, !!e)
        },
        addChild: function (t, e) {
          return t.remove(), (void 0 === e || e < 0 || e > this._children.length) && (e = this._children.length), this._children.splice(e, 0, t), t._parent = this, this.needsDisplay = !0, t
        },
        insertBefore: function (t, e) {
          return this.addChild(t, this._children.indexOf(e))
        },
        insertAfter: function (t, e) {
          return this.addChild(t, this._children.indexOf(e) + 1)
        },
        removeChild: function (t) {
          if (t._parent === this) {
            var e = this._children.indexOf(t);
            if (-1 !== e) return this._children.splice(e, 1), d(t), this.needsDisplay = !0, t
          }
        },
        replaceChild: function (t, e) {
          if (e && e._parent === this) {
            var i = this._children.indexOf(e);
            return t.remove(), this._children.splice(i, 1, t), d(e), t._parent = this, this.needsDisplay = !0, e
          }
        },
        remove: function () {
          if (this._parent instanceof c) return this._parent.removeChild(this)
        },
        wasRemoved: function () { },
        convertPointFromPage: function (t) {
          if (this.element) return a.fromPageToElement(this.element, t);
          var e = u(this),
            i = a.fromPageToElement(e.element, t);
          return new o(i.x + e.offsetX, i.y + e.offsetY)
        },
        convertPointToPage: function (t) {
          if (this.element) return a.fromElementToPage(this.element, t);
          var e = u(this),
            i = a.fromElementToPage(e.element, t);
          return new o(i.x - e.offsetX, i.y - e.offsetY)
        },
        _needsLayerBacking: function () {
          return this.opacity < 1 && (this._children.length > 1 || 1 === this._children.length && this._children[0]._children.length > 0)
        }
      }, t.exports = c
    },
    1796: (t, e, i) => {
      var n = i(5989),
        o = i(69),
        s = i(2114);

      function r() {
        n.call(this), this._renderer = new o(this)
      }
      r.prototype = s.inheritPrototype(n, r, {
        stringInfo: function () {
          return "GroupNode"
        }
      }), t.exports = r
    },
    5190: (t, e, i) => {
      var n = i(4140),
        o = i(2114),
        s = i(5989),
        r = i(1750);

      function a() {
        s.call(this), this._image = null, this._renderer = new r(this)
      }
      a.prototype = o.inheritPrototype(s, a, {
        get image() {
          return this._image
        },
        set image(t) {
          this._image !== t && (this._image && this._image.removeEventListener("load", this), this._image = t, this._imageDidLoad(), !t || t.src && t.complete || t.addEventListener("load", this))
        },
        stringInfo: function () {
          var t = this._image ? this._image.src : null;
          if (o.isNode()) {
            var e = t.split("src/images/");
            2 === e.length && (t = e[1])
          }
          return "ImageNode" + (t ? "<src:" + t + ">" : "")
        },
        handleEvent: function (t) {
          t.target === this._image && this._image.complete && (this._image.removeEventListener("load", this), this._imageDidLoad(), this.needsDisplay = !0)
        },
        _imageDidLoad: function () {
          this.size.equals(n.Zero) && (this.size = new n(this._image.width, this._image.height)), this.needsDisplay = !0
        }
      }), t.exports = a
    },
    3931: (t, e, i) => {
      var n = i(5989),
        o = i(8614),
        s = i(2114);

      function r() {
        n.call(this), this._renderer = new o(this)
      }
      r.prototype = s.inheritPrototype(n, r, {
        get element() {
          return this._renderer.element
        },
        destroy: function () {
          this.children = [], this._renderer._ctx = null, this._renderer._canvas.width = this._renderer._canvas.height = 0
        },
        stringInfo: function () {
          return "Scene"
        }
      }), t.exports = r
    },
    9985: (t, e, i) => {
      var n = i(210),
        o = i(311),
        s = i(4937),
        r = i(2114);

      function a(t) {
        this.node = t.node, this.node.animators || (this.node.animators = []), this.node.animators.push(this), this.duration = t.duration, ["from", "to", "done"].forEach((function (e) {
          e in t && null != t[e] && (this[e] = t[e])
        }), this)
      }

      function l(t) {
        a.call(this, t)
      }

      function h(t) {
        t.pop && (this.springSolver = new u(1, this.STIFFNESS, this.DAMPING, 0)), a.call(this, t)
      }

      function c(t) {
        a.call(this, t), t.center && (this.center = t.center)
      }

      function d(t) {
        this.popAnimationDone = t.done || r.noop, delete t.done, t.duration *= this.FLOAT_DURATION_SCALE, a.call(this, t), t.center && (this.center = t.center), t.floatCenter && (this.floatCenter = t.floatCenter), this.popSpringSolver = new u(1, this.SCALE_STIFFNESS, this.SCALE_DAMPING, 0), t.to > t.from && (this.swayAmplitude = (Math.random() < .5 ? -1 : 1) * (3 + 3 * Math.random()), this.rotateSpringSolver = new u(1, this.ROTATE_STIFFNESS, this.ROTATE_DAMPING, 0))
      }
      a.prototype = {
        from: 0,
        to: 1,
        done: r.noop,
        begin: function () {
          return this.beginDate = Date.now(), s.scheduleASAP(this), this
        },
        end: function () {
          this.node.animators.splice(this.node.animators.indexOf(this), 1), 0 === this.node.animators.length && delete this.node.animators, delete this.beginDate, this.done(this)
        },
        performScheduledUpdate: function () {
          this.beginDate && (this._p = Math.min((Date.now() - this.beginDate) / this.duration, 1), this.update(this._p), this._p < 1 ? s.scheduleOnNextFrame(this) : this.end())
        },
        valueAt: function (t) {
          return this.from + t * (this.to - this.from)
        },
        stringInfo: function (t, e) {
          var i = "🏇" + t + "<" + this.duration + "ms; " + this.from + "→" + this.to;
          return this._p >= 0 && (i += "/" + Math.round(100 * this._p) + "%"), Object.prototype.hasOwnProperty.call(this, "done") && (i += "*"), i + (e || "") + ">"
        }
      }, l.prototype = r.inheritPrototype(a, l, {
        update: function (t) {
          this.node.opacity = this.valueAt(t)
        },
        stringInfo: function () {
          return a.prototype.stringInfo.call(this, "opacity")
        }
      }), h.prototype = r.inheritPrototype(a, h, {
        from: new n(0, 0),
        to: new n(0, 0),
        STIFFNESS: 100,
        DAMPING: 10,
        update: function (t) {
          this.springSolver && (t = this.springSolver.solve(t)), this.node.transform = (new o).translate(this.from.x + t * (this.to.x - this.from.x), this.from.y + t * (this.to.y - this.from.y))
        },
        end: function () {
          this.node.transform = (new o).translate(this.to.x, this.to.y), a.prototype.end.call(this)
        },
        stringInfo: function () {
          return a.prototype.stringInfo.call(this, "translation")
        }
      }), c.prototype = r.inheritPrototype(a, c, {
        center: new n(0, 0),
        scale: function (t) {
          var e = this.center.x,
            i = this.center.y;
          this.node.transform = (new o).translate(e, i).scale(t).translate(-e, -i)
        },
        update: function (t) {
          this.scale(this.valueAt(t))
        },
        stringInfo: function () {
          var t = "";
          return 0 === this.center.x && 0 === this.center.y || (t += " (" + this.center.x + ", " + this.center.y + ")"), a.prototype.stringInfo.call(this, "scale", t)
        }
      });

      function u(t, e, i, n) {
        this.w0 = Math.sqrt(e / t), this.zeta = i / (2 * Math.sqrt(e * t)), this.zeta < 1 ? (this.wd = this.w0 * Math.sqrt(1 - this.zeta * this.zeta), this.A = 1, this.B = (this.zeta * this.w0 - n) / this.wd) : (this.wd = 0, this.A = 1, this.B = -n + this.w0)
      }
      d.prototype = r.inheritPrototype(a, d, {
        center: new n(0, 0),
        SCALE_STIFFNESS: 100,
        SCALE_DAMPING: 10,
        FLOAT_DURATION_SCALE: 4.2,
        ROTATE_DAMPING: 5,
        ROTATE_STIFFNESS: 127.15275,
        scaleAndRotate: function (t, e) {
          var i = this.center.x,
            n = this.center.y;
          this.floatCenter ? this.node.transform = (new o).translate(this.floatCenter.x, this.floatCenter.y).rotate(e).translate(-this.floatCenter.x, -this.floatCenter.y).translate(i, n).scale(t).translate(-i, -n) : this.node.transform = (new o).translate(i, n).scale(t).rotate(e).translate(-i, -n)
        },
        update: function (t) {
          var e = t * this.FLOAT_DURATION_SCALE,
            i = this.valueAt(this.popSpringSolver.solve(e)),
            n = 0;
          this.rotateSpringSolver && (n = (this.rotateSpringSolver.solve(t) - 1) * this.swayAmplitude), this.scaleAndRotate(i, n), e > 1 && !this.popAnimationDoneCalled && (this.popAnimationDoneCalled = !0, this.popAnimationDone(this))
        },
        end: function () {
          this.scaleAndRotate(this.to, 0), a.prototype.end.call(this), this.popAnimationDoneCalled || this.popAnimationDone(this)
        },
        stringInfo: function () {
          var t = "";
          0 === this.center.x && 0 === this.center.y || (t += " (" + this.center.x + ", " + this.center.y + ")");
          var e = "float";
          return this.popAnimationDoneCalled && (e += " (swing)"), a.prototype.stringInfo.call(this, e, t)
        }
      }), u.prototype.solve = function (t) {
        return 1 - (t = this.zeta < 1 ? Math.exp(-t * this.zeta * this.w0) * (this.A * Math.cos(this.wd * t) + this.B * Math.sin(this.wd * t)) : (this.A + this.B * t) * Math.exp(-t * this.w0))
      }, t.exports = {
        Basic: a,
        Opacity: l,
        Translation: h,
        Scale: c,
        Float: d
      }
    },
    1750: (t, e, i) => {
      var n = i(69),
        o = i(2114);

      function s(t) {
        n.call(this, t)
      }
      s.prototype = o.inheritPrototype(n, s, {
        _lastDrawnImage: null,
        draw: function (t) {
          this._node.image && (this._node.image.complete && this._node.image.naturalWidth ? (this._lastDrawnImage = this._node.image, t.drawImage(this._node.image, 0, 0, this._node.size.width, this._node.size.height)) : this._node.image === this._lastDrawnImage && (this._node.needsDisplay = !0))
        }
      }), t.exports = s
    },
    69: (t, e, i) => {
      var n = i(2114),
        o = i(3658);

      function s(t) {
        this._node = t, this._layer = null
      }
      var r = {};
      s.prototype = {
        constructor: s,
        get node() {
          return this._node
        },
        get shouldDraw() {
          var t = this._node.keyForFrozenLayer;
          return !(this._frozenLayer && (!this._sharedLayer || this._sharedLayer.key === t) || t && r[t])
        },
        get layer() {
          var t = this._node,
            e = t.frozen,
            i = t.keyForFrozenLayer;
          if (e) {
            if (this._frozenLayer) {
              if (!i || !this._sharedLayer || this._sharedLayer.key === i) return this._frozenLayer;
              this.releaseLayer()
            }
            if (i) {
              var n = r[i];
              if (n && n.key === i) return this._sharedLayer = n, this._layer = this._frozenLayer = n.canvas, ++n.count, n.canvas
            }
          }
          delete this._frozenLayer, this._layer || (this._layer = this.createCanvas(), i && (this._sharedLayer = r[i] = {
            canvas: this._layer,
            count: 1,
            key: i
          }));
          var s = o.devicePixelRatio,
            a = t.layerBounds;
          this._layer.width = Math.ceil(a.size.width * s), this._layer.height = Math.ceil(a.size.height * s);
          var l = this._layer.getContext("2d");
          return l && (l.scale(s, s), l.translate(-a.origin.x, -a.origin.y)), e && (this._frozenLayer = this._layer), this._layer
        },
        releaseLayer: function (t) {
          this._layer && (this._sharedLayer ? t || (--this._sharedLayer.count, 0 === this._sharedLayer.count && (delete r[this._sharedLayer.key], this._layer.width = 0)) : this._layer.width = 0, delete this._sharedLayer, delete this._frozenLayer, delete this._layer)
        },
        nodeWasRemoved: function () {
          this._layer && function (t) {
            0 === a.length && setTimeout((function () {
              a.forEach((function (t) {
                t._node.scene || t.releaseLayer()
              })), a = []
            }), 0);
            a.push(t)
          }(this)
        },
        createCanvas: function () {
          return n.createCanvas()
        },
        draw: function (t) { }
      };
      var a = [];
      s.releaseSharedLayers = function () {
        Object.keys(r).forEach((function (t) {
          var e = r[t];
          e.canvas.width = 0, delete e.key, delete e.canvas
        })), r = {}
      }, t.exports = s
    },
    8614: (t, e, i) => {
      var n = i(1593),
        o = i(2114),
        s = i(3658),
        r = i(69);

      function a(t) {
        r.call(this, t), this._canvas = this.createCanvas(), this._ctx = this._canvas.getContext("2d")
      }

      function l(t, e, i, n, o, s) {
        if (e && 0 !== t.opacity) {
          var r = t.renderer;
          o && r.releaseLayer(!0);
          var a = r.shouldDraw,
            h = t.wantsLayerBacking ? r.layer : null;
          if (h || t.frozen || r.releaseLayer(), !t.wantsLayerBacking || h) {
            var c = function (r) {
              if (e.save(), e.translate(r, u), e.transform(p.a, p.b, p.c, p.d, p.e, p.f), e.globalAlpha = s, a || !t.frozen) {
                var c = h ? h.getContext("2d") : e;
                t.renderer.draw(c);
                for (var d = t.children, m = 0, g = d.length; m < g; ++m) l(d[m], c, i, n, o, h ? 1 : s)
              }
              h && 0 !== h.width && 0 !== h.height && e.drawImage(h, t.layerBounds.origin.x, t.layerBounds.origin.y, h.width / n, h.height / n), e.restore()
            },
              d = t.position.x,
              u = t.position.y,
              p = t.transform;
            s *= t.opacity, c(d), t.repeatOffset && c(d + t.repeatOffset)
          }
        }
      }
      a.prototype = o.inheritPrototype(r, a, {
        get element() {
          return this._canvas
        },
        update: function () {
          if (this._ctx) {
            var t = this._node,
              e = t.size,
              i = s.devicePixelRatio,
              o = !this._previousScale || this._previousScale !== i;

            o && r.releaseSharedLayers(),
              !o && this._previousSize && this._previousSize.equals(e) ? this._ctx.clearRect(0, 0, e.width * i, e.height * i) : (this._canvas.style.width = e.width + "px", this._canvas.style.height = e.height + "px",
                this._canvas.width = e.width * i,
                this._canvas.height = e.height * i,
                this._previousSize = e.copy(),
                this._previousScale = i),
              this._ctx.scale(i, i),
              window.onMapkitUpdate?.(),
              l(this.node, this._ctx,
                new n(-t.position.x, -t.position.y, e.width, e.height), i, o, 1),
              this._ctx.scale(1 / i, 1 / i)
          }
        }
      }), t.exports = a
    },
    311: (t, e, i) => {
      var n = i(210);

      function o() {
        if (this._ = [
          [1, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1]
        ], 6 === arguments.length) this._setValues(["a", "b", "c", "d", "e", "f"], arguments);
        else if (16 === arguments.length) this._setValues(["m11", "m12", "m13", "m14", "m21", "m22", "m23", "m24", "m31", "m32", "m33", "m34", "m41", "m42", "m43", "m44"], arguments);
        else if (1 == arguments.length) {
          var t = arguments[0];
          if ("string" == typeof t) {
            if ("none" === t) return;
            t = t.match(/\bmatrix(?:3d)?\(([^)]+)\)/)[1].split(",").map(parseFloat)
          }
          6 === t.length ? this._setValues(["a", "b", "c", "d", "e", "f"], t) : 16 === t.length && this._setValues(["m11", "m12", "m13", "m14", "m21", "m22", "m23", "m24", "m31", "m32", "m33", "m34", "m41", "m42", "m43", "m44"], t)
        }
      }

      function s(t) {
        return t / 180 * Math.PI
      }

      function r(t, e, i, n) {
        return t * n - e * i
      }

      function a(t, e, i, n, o, s, a, l, h) {
        return t * r(o, s, l, h) - n * r(e, i, l, h) + a * r(e, i, o, s)
      }
      o.prototype = {
        constructor: o,
        get a() {
          return this._[0][0]
        },
        get b() {
          return this._[0][1]
        },
        get c() {
          return this._[1][0]
        },
        get d() {
          return this._[1][1]
        },
        get e() {
          return this._[3][0]
        },
        get f() {
          return this._[3][1]
        },
        get m11() {
          return this._[0][0]
        },
        get m12() {
          return this._[0][1]
        },
        get m13() {
          return this._[0][2]
        },
        get m14() {
          return this._[0][3]
        },
        get m21() {
          return this._[1][0]
        },
        get m22() {
          return this._[1][1]
        },
        get m23() {
          return this._[1][2]
        },
        get m24() {
          return this._[1][3]
        },
        get m31() {
          return this._[2][0]
        },
        get m32() {
          return this._[2][1]
        },
        get m33() {
          return this._[2][2]
        },
        get m34() {
          return this._[2][3]
        },
        get m41() {
          return this._[3][0]
        },
        get m42() {
          return this._[3][1]
        },
        get m43() {
          return this._[3][2]
        },
        get m44() {
          return this._[3][3]
        },
        set a(t) {
          this._[0][0] = t
        },
        set b(t) {
          this._[0][1] = t
        },
        set c(t) {
          this._[1][0] = t
        },
        set d(t) {
          this._[1][1] = t
        },
        set e(t) {
          this._[3][0] = t
        },
        set f(t) {
          this._[3][1] = t
        },
        set m11(t) {
          this._[0][0] = t
        },
        set m12(t) {
          this._[0][1] = t
        },
        set m13(t) {
          this._[0][2] = t
        },
        set m14(t) {
          this._[0][3] = t
        },
        set m21(t) {
          this._[1][0] = t
        },
        set m22(t) {
          this._[1][1] = t
        },
        set m23(t) {
          this._[1][2] = t
        },
        set m24(t) {
          this._[1][3] = t
        },
        set m31(t) {
          this._[2][0] = t
        },
        set m32(t) {
          this._[2][1] = t
        },
        set m33(t) {
          this._[2][2] = t
        },
        set m34(t) {
          this._[2][3] = t
        },
        set m41(t) {
          this._[3][0] = t
        },
        set m42(t) {
          this._[3][1] = t
        },
        set m43(t) {
          this._[3][2] = t
        },
        set m44(t) {
          this._[3][3] = t
        },
        translate: function (t, e, i) {
          return t = t || 0, e = e || 0, i = i || 0, this._[3][0] += t * this._[0][0] + e * this._[1][0] + i * this._[2][0], this._[3][1] += t * this._[0][1] + e * this._[1][1] + i * this._[2][1], this._[3][2] += t * this._[0][2] + e * this._[1][2] + i * this._[2][2], this._[3][3] += t * this._[0][3] + e * this._[1][3] + i * this._[2][3], this
        },
        scale: function (t, e, i) {
          return t = t || 1, e = e || t, i = i || 1, this._[0][0] *= t, this._[0][1] *= t, this._[0][2] *= t, this._[0][3] *= t, this._[1][0] *= e, this._[1][1] *= e, this._[1][2] *= e, this._[1][3] *= e, this._[2][0] *= i, this._[2][1] *= i, this._[2][2] *= i, this._[2][3] *= i, this
        },
        rotate: function (t) {
          return this.rotateAxisAngle(0, 0, 1, t)
        },
        rotateAxisAngle: function (t, e, i, n) {
          0 === t && 0 === e && 0 === i && (i = 1);
          var r = Math.sqrt(t * t + e * e + i * i);
          1 != r && (t /= r, e /= r, i /= r), n = s(n);
          var a = Math.sin(n),
            l = Math.cos(n),
            h = new o;
          if (1 === t && 0 === e && 0 === i) h._[0][0] = 1, h._[0][1] = 0, h._[0][2] = 0, h._[1][0] = 0, h._[1][1] = l, h._[1][2] = a, h._[2][0] = 0, h._[2][1] = -a, h._[2][2] = l, h._[0][3] = h._[1][3] = h._[2][3] = 0, h._[3][0] = h._[3][1] = h._[3][2] = 0, h._[3][3] = 1;
          else if (0 === t && 1 === e && 0 === i) h._[0][0] = l, h._[0][1] = 0, h._[0][2] = -a, h._[1][0] = 0, h._[1][1] = 1, h._[1][2] = 0, h._[2][0] = a, h._[2][1] = 0, h._[2][2] = l, h._[0][3] = h._[1][3] = h._[2][3] = 0, h._[3][0] = h._[3][1] = h._[3][2] = 0, h._[3][3] = 1;
          else if (0 === t && 0 === e && 1 === i) h._[0][0] = l, h._[0][1] = a, h._[0][2] = 0, h._[1][0] = -a, h._[1][1] = l, h._[1][2] = 0, h._[2][0] = 0, h._[2][1] = 0, h._[2][2] = 1, h._[0][3] = h._[1][3] = h._[2][3] = 0, h._[3][0] = h._[3][1] = h._[3][2] = 0, h._[3][3] = 1;
          else {
            var c = 1 - l;
            h._[0][0] = l + t * t * c, h._[0][1] = e * t * c + i * a, h._[0][2] = i * t * c - e * a, h._[1][0] = t * e * c - i * a, h._[1][1] = l + e * e * c, h._[1][2] = i * e * c + t * a, h._[2][0] = t * i * c + e * a, h._[2][1] = e * i * c - t * a, h._[2][2] = l + i * i * c, h._[0][3] = h._[1][3] = h._[2][3] = 0, h._[3][0] = h._[3][1] = h._[3][2] = 0, h._[3][3] = 1
          }
          return this.multiply(h)
        },
        multiply: function (t) {
          var e = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
          ];
          return e[0][0] = t._[0][0] * this._[0][0] + t._[0][1] * this._[1][0] + t._[0][2] * this._[2][0] + t._[0][3] * this._[3][0], e[0][1] = t._[0][0] * this._[0][1] + t._[0][1] * this._[1][1] + t._[0][2] * this._[2][1] + t._[0][3] * this._[3][1], e[0][2] = t._[0][0] * this._[0][2] + t._[0][1] * this._[1][2] + t._[0][2] * this._[2][2] + t._[0][3] * this._[3][2], e[0][3] = t._[0][0] * this._[0][3] + t._[0][1] * this._[1][3] + t._[0][2] * this._[2][3] + t._[0][3] * this._[3][3], e[1][0] = t._[1][0] * this._[0][0] + t._[1][1] * this._[1][0] + t._[1][2] * this._[2][0] + t._[1][3] * this._[3][0], e[1][1] = t._[1][0] * this._[0][1] + t._[1][1] * this._[1][1] + t._[1][2] * this._[2][1] + t._[1][3] * this._[3][1], e[1][2] = t._[1][0] * this._[0][2] + t._[1][1] * this._[1][2] + t._[1][2] * this._[2][2] + t._[1][3] * this._[3][2], e[1][3] = t._[1][0] * this._[0][3] + t._[1][1] * this._[1][3] + t._[1][2] * this._[2][3] + t._[1][3] * this._[3][3], e[2][0] = t._[2][0] * this._[0][0] + t._[2][1] * this._[1][0] + t._[2][2] * this._[2][0] + t._[2][3] * this._[3][0], e[2][1] = t._[2][0] * this._[0][1] + t._[2][1] * this._[1][1] + t._[2][2] * this._[2][1] + t._[2][3] * this._[3][1], e[2][2] = t._[2][0] * this._[0][2] + t._[2][1] * this._[1][2] + t._[2][2] * this._[2][2] + t._[2][3] * this._[3][2], e[2][3] = t._[2][0] * this._[0][3] + t._[2][1] * this._[1][3] + t._[2][2] * this._[2][3] + t._[2][3] * this._[3][3], e[3][0] = t._[3][0] * this._[0][0] + t._[3][1] * this._[1][0] + t._[3][2] * this._[2][0] + t._[3][3] * this._[3][0], e[3][1] = t._[3][0] * this._[0][1] + t._[3][1] * this._[1][1] + t._[3][2] * this._[2][1] + t._[3][3] * this._[3][1], e[3][2] = t._[3][0] * this._[0][2] + t._[3][1] * this._[1][2] + t._[3][2] * this._[2][2] + t._[3][3] * this._[3][2], e[3][3] = t._[3][0] * this._[0][3] + t._[3][1] * this._[1][3] + t._[3][2] * this._[2][3] + t._[3][3] * this._[3][3], this._ = e, this
        },
        skewX: function (t) {
          return this._skew(t, 0)
        },
        skewY: function (t) {
          return this._skew(0, t)
        },
        isAffine: function () {
          return 0 == this._[0][2] && 0 == this._[0][3] && 0 == this._[1][2] && 0 == this._[1][3] && 0 == this._[2][0] && 0 == this._[2][1] && 1 == this._[2][2] && 0 == this._[2][3] && 0 == this._[3][2] && 1 == this._[3][3]
        },
        inverse: function () {
          if (this._isIdentityOrTranslation()) return 0 == this._[3][0] && 0 == this._[3][1] && 0 == this._[3][2] || (this._[3][0] *= -1, this._[3][1] *= -1, this._[3][2] *= -1), this;
          var t = new o;
          return function (t, e) {
            ! function (t, e) {
              var i = t._[0][0],
                n = t._[0][1],
                o = t._[0][2],
                s = t._[0][3],
                r = t._[1][0],
                l = t._[1][1],
                h = t._[1][2],
                c = t._[1][3],
                d = t._[2][0],
                u = t._[2][1],
                p = t._[2][2],
                m = t._[2][3],
                g = t._[3][0],
                _ = t._[3][1],
                f = t._[3][2],
                y = t._[3][3];
              e._[0][0] = a(l, u, _, h, p, f, c, m, y), e._[1][0] = -a(r, d, g, h, p, f, c, m, y), e._[2][0] = a(r, d, g, l, u, _, c, m, y), e._[3][0] = -a(r, d, g, l, u, _, h, p, f), e._[0][1] = -a(n, u, _, o, p, f, s, m, y), e._[1][1] = a(i, d, g, o, p, f, s, m, y), e._[2][1] = -a(i, d, g, n, u, _, s, m, y), e._[3][1] = a(i, d, g, n, u, _, o, p, f), e._[0][2] = a(n, l, _, o, h, f, s, c, y), e._[1][2] = -a(i, r, g, o, h, f, s, c, y), e._[2][2] = a(i, r, g, n, l, _, s, c, y), e._[3][2] = -a(i, r, g, n, l, _, o, h, f), e._[0][3] = -a(n, l, u, o, h, p, s, c, m), e._[1][3] = a(i, r, d, o, h, p, s, c, m), e._[2][3] = -a(i, r, d, n, l, u, s, c, m), e._[3][3] = a(i, r, d, n, l, u, o, h, p)
            }(t, e);
            var i = t._determinant();
            if (Math.abs(i) < 1e-8) return !1;
            for (var n = 0; n < 4; n++)
              for (var o = 0; o < 4; o++) e._[n][o] = e._[n][o] / i;
            return !0
          }(this, t) ? t : new o
        },
        transformPoint: function (t) {
          return new n(this._[0][0] * t.x + this._[1][0] * t.y + this._[2][0] * t.z + this._[3][0], this._[0][1] * t.x + this._[1][1] * t.y + this._[2][1] * t.z + this._[3][1], this._[0][2] * t.x + this._[1][2] * t.y + this._[2][2] * t.z + this._[3][2])
        },
        toString: function () {
          return this.isAffine() ? "matrix(" + [this._[0][0], this._[0][1], this._[1][0], this._[1][1], this._[3][0], this._[3][1]].join(", ") + ")" : "matrix3d(" + this._.map((function (t) {
            return t.join(", ")
          })).join(", ") + ")"
        },
        _setValues: function (t, e) {
          t.forEach((function (t, i) {
            this[t] = e[i]
          }), this)
        },
        _isIdentityOrTranslation: function () {
          return 1 == this._[0][0] && 0 == this._[0][1] && 0 == this._[0][2] && 0 == this._[0][3] && 0 == this._[1][0] && 1 == this._[1][1] && 0 == this._[1][2] && 0 == this._[1][3] && 0 == this._[2][0] && 0 == this._[2][1] && 1 == this._[2][2] && 0 == this._[2][3] && 1 == this._[3][3]
        },
        _skew: function (t, e) {
          var i = new o;
          return i._[0][1] = Math.tan(s(e)), i._[1][0] = Math.tan(s(t)), this.multiply(i)
        },
        _determinant: function () {
          var t = this._[0][0],
            e = this._[0][1],
            i = this._[0][2],
            n = this._[0][3],
            o = this._[1][0],
            s = this._[1][1],
            r = this._[1][2],
            l = this._[1][3],
            h = this._[2][0],
            c = this._[2][1],
            d = this._[2][2],
            u = this._[2][3],
            p = this._[3][0],
            m = this._[3][1],
            g = this._[3][2],
            _ = this._[3][3];
          return t * a(s, c, m, r, d, g, l, u, _) - e * a(o, h, p, r, d, g, l, u, _) + i * a(o, h, p, s, c, m, l, u, _) - n * a(o, h, p, s, c, m, r, d, g)
        }
      }, t.exports = o
    },
    9477: t => {
      function e() {
        this._operations = []
      }

      function i(t, e, i) {
        this.x = l(t), this.y = l(e), this.z = l(i)
      }

      function n(t, e, i) {
        this.x = l(t, 1), this.y = l(e, this.x), this.z = l(i, 1)
      }

      function o(t) {
        this.angle = l(t)
      }

      function s(t, e) {
        this.x = l(t), this.y = l(e)
      }

      function r(t, e, i, n) {
        this.x = l(t), this.y = l(e), this.z = l(i), this.angle = l(n)
      }

      function a() {
        if (1 === arguments.length) return arguments[0] + "px";
        for (var t = 0, e = arguments.length, i = []; t < e; ++t) i.push(a(arguments[t]));
        return i.join(", ")
      }

      function l(t, e) {
        return null == t ? e || 0 : t
      }

      function h(t, e) {
        return t + "(" + e + ")"
      }
      e.prototype = {
        constructor: e,
        translate: function (t, e, n) {
          return this._operations.push(new i(t, e, n)), this
        },
        scale: function (t, e, i) {
          return this._operations.push(new n(t, e, i)), this
        },
        rotate: function (t) {
          return this._operations.push(new o(t)), this
        },
        rotate3d: function (t, e, i, n) {
          return this._operations.push(new r(t, e, i, n)), this
        },
        skew: function (t, e) {
          return this._operations.push(new s(t, e)), this
        },
        transform: function (t) {
          return this._operations = this._operations.concat(t), this
        },
        toString: function () {
          return this._operations.map((function (t) {
            return t.toString()
          })).join(" ")
        }
      }, t.exports = e, i.prototype = {
        constructor: i,
        toString: function () {
          return !this.x || this.y || this.z ? !this.y || this.x || this.z ? !this.z || this.x || this.y ? this.z ? h("translate3d", a(this.x, this.y, this.z)) : h("translate", a(this.x, this.y)) : h("translateZ", a(this.z)) : h("translateY", a(this.y)) : h("translateX", a(this.x))
        }
      }, n.prototype = {
        constructor: n,
        toString: function () {
          return 1 !== this.x && 1 === this.y && 1 === this.z ? h("scaleX", this.x) : 1 !== this.y && 1 === this.x && 1 === this.z ? h("scaleY", this.y) : 1 !== this.z && 1 === this.x && 1 === this.y ? h("scaleZ", this.z) : 1 === this.z ? this.x === this.y ? h("scale", this.x) : h("scale", [this.x, this.y].join(", ")) : h("scale3d", [this.x, this.y, this.z].join(", "))
        }
      }, o.prototype = {
        constructor: o,
        toString: function () {
          return h("rotate", angle + "deg")
        }
      }, s.prototype = {
        constructor: s,
        toString: function () {
          return 0 !== this.x && 0 === this.y ? h("skewX", this.x + "deg") : 0 !== this.y && 0 === this.x ? h("skewY", this.y + "deg") : h("skew", [this.x + "deg", this.y + "deg"].join(", "))
        }
      }, r.prototype = {
        constructor: o,
        toString: function () {
          return h("rotate3d", [this.x, this.y, this.z, this.angle].join(", ") + "deg")
        }
      }
    },
    7640: t => {
      function e(t) {
        if (t) return t.addEventListener = e.prototype.addEventListener, t.removeEventListener = e.prototype.removeEventListener, t.dispatchEvent = e.prototype.dispatchEvent, t
      }

      function i(t) {
        this.type = t, this.target = null, this.defaultPrevented = !1, this._stoppedPropagation = !1
      }
      e.prototype = {
        constructor: e,
        addEventListener: function (t, e, i) {
          if (i = i || null, !t) return !1;
          if (!e) return !1;
          this._listeners || (this._listeners = {});
          var n = this._listeners[t];
          n || (n = this._listeners[t] = []);
          for (var o = 0; o < n.length; ++o)
            if (n[o].listener === e && n[o].thisObject === i) return !1;
          return n.push({
            thisObject: i,
            listener: e
          }), !0
        },
        removeEventListener: function (t, e, i) {
          if (t = t || null, e = e || null, i = i || null, !this._listeners) return !1;
          if (!t) {
            for (t in this._listeners) this.removeEventListener(t, e, i);
            return !1
          }
          var n = this._listeners[t];
          if (!n) return !1;
          for (var o = !1, s = n.length - 1; s >= 0; --s)
            if (e && n[s].listener === e && n[s].thisObject === i || !e && i && n[s].thisObject === i) {
              n.splice(s, 1), o = !0;
              break
            } return n.length || delete this._listeners[t], Object.keys(this._listeners).length || delete this._listeners, o
        },
        dispatchEvent: function (t) {
          if (t.target = this, !this._listeners || !this._listeners[t.type] || t._stoppedPropagation) return !0;
          for (var e = this._listeners[t.type].slice(0), i = 0; i < e.length; ++i) {
            var n = e[i].thisObject,
              o = e[i].listener;
            if (n || "function" == typeof o || "function" != typeof o.handleEvent ? o.call(n, t) : o.handleEvent.call(o, t), t._stoppedPropagation) break
          }
          return !t.defaultPrevented
        }
      }, i.prototype = {
        constructor: i,
        stopPropagation: function () {
          this._stoppedPropagation = !0
        },
        preventDefault: function () {
          this.defaultPrevented = !0
        }
      }, t.exports = {
        EventTarget: e,
        Event: i
      }
    },
    8552: (t, e, i) => {
      var n = i(1002),
        o = i(5473),
        s = i(7975);
      t.exports = function (t, e) {
        t = t || 0, e = e || 0;
        var i = {};
        return i.shouldTryCSR = [n, o, s].every((function (n) {
          var o = n.fn(t, e);
          return i[n.name] = o, "object" == typeof o ? o.capable : o
        })), i
      }
    },
    5473: t => {
      t.exports = {
        name: "functions",
        fn: function () {
          return !!(Array.prototype.fill && Uint8Array.from && window.btoa)
        }
      }
    },
    1002: t => {
      t.exports = {
        name: "types",
        fn: function () {
          return !!(Float32Array && Float64Array && Uint8Array && Int32Array)
        }
      }
    },
    7975: t => {
      function e(t, e, i) {
        return t.getParameter(t.MAX_TEXTURE_SIZE) >= 4096 && t.getParameter(t.MAX_RENDERBUFFER_SIZE) >= 2 * e && t.getParameter(t.MAX_RENDERBUFFER_SIZE) >= 2 * i && t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS) >= 8 && t.getParameter(t.MAX_VARYING_VECTORS) >= 8 && t.getParameter(t.STENCIL_BITS) >= 8
      }
      t.exports = {
        name: "webGL",
        fn: function (t, i) {
          var n = document.createElement("canvas");
          n.width = n.height = 0;
          var o, s = n.getContext("webgl", {
            antialias: !1,
            stencil: !0,
            failIfMajorPerformanceCaveat: !0
          });
          return !!s && {
            capable: e(s, t, i),
            gpuInfo: (o = s, {
              VERSION: o.getParameter(o.VERSION),
              MAX_RENDERBUFFER_SIZE: o.getParameter(o.MAX_RENDERBUFFER_SIZE)
            })
          }
        }
      }
    },
    8212: t => {
      "use strict";

      function e(t, e, i, n) {
        1 === arguments.length && t && "object" == typeof t ? ("x" in t && (this.x = t.x), "y" in e && (this.y = t.y), "z" in t && (this.z = t.z), "w" in t && (this.w = t.w)) : arguments.length > 0 && (this.x = t, arguments.length > 1 && (this.y = e, arguments.length > 2 && (this.z = i, arguments.length > 3 && (this.w = n))))
      }
      e.prototype = {
        _x: 0,
        _y: 0,
        _z: 0,
        _w: 1,
        get x() {
          return this._x
        },
        set x(t) {
          if (null === t || isNaN(t)) throw new Error("[DOMPoint] `" + t + "` set for x is not a number");
          this._x = t
        },
        get y() {
          return this._y
        },
        set y(t) {
          if (null === t || isNaN(t)) throw new Error("[DOMPoint] `" + t + "` set for y is not a number");
          this._y = t
        },
        get z() {
          return this._z
        },
        set z(t) {
          if (null === t || isNaN(t)) throw new Error("[DOMPoint] `" + t + "` set for z is not a number");
          this._z = t
        },
        get w() {
          return this._w
        },
        set w(t) {
          if (null === t || isNaN(t)) throw new Error("[DOMPoint] `" + t + "` set for w is not a number");
          this._w = t
        },
        matrixTransform: function (t) {
          return console.warn("DOMPoint.matrixTransform is not implemented yet."), this
        }
      }, t.exports = e
    },
    7236: (t, e, i) => {
      t.exports = {
        Point: i(210),
        Size: i(4140),
        Rect: i(1593)
      }
    },
    210: t => {
      function e(t, e, i) {
        this.x = t || 0, this.y = e || 0, this.z = i || 0
      }
      t.exports = e, e.Zero = new e, e.fromEvent = function (t) {
        var i = "undefined" != typeof TouchEvent && t instanceof TouchEvent ? t.targetTouches[0] : t;
        return new e(i.pageX, i.pageY)
      }, e.fromEventInElement = function (t, i) {
        var n = "undefined" != typeof TouchEvent && t instanceof TouchEvent ? t.targetTouches[0] : t,
          o = window.webkitConvertPointFromPageToNode(i, new WebKitPoint(n.pageX, n.pageY));
        return new e(o.x, o.y)
      }, e.prototype = {
        constructor: e,
        toString: function () {
          return "Point[" + [this.x, this.y, this.z].join(", ") + "]"
        },
        copy: function () {
          return new e(this.x, this.y, this.z)
        },
        equals: function (t) {
          return this.x === t.x && this.y === t.y && this.z === t.z
        },
        distanceToPoint: function (t) {
          return Math.sqrt(Math.pow(this.x - t.x, 2) + Math.pow(this.y - t.y, 2) + Math.pow(this.z - t.z, 2))
        }
      }
    },
    1593: (t, e, i) => {
      t.exports = s;
      var n = i(210),
        o = i(4140);

      function s(t, e, i, s) {
        this.origin = new n(t || 0, e || 0), this.size = new o(i || 0, s || 0)
      }
      s.Zero = new s, s.rectFromClientRect = function (t) {
        return new s(t.left, t.top, t.width, t.height)
      }, s.unionOfRects = function (t) {
        for (var e = t[0], i = 1; i < t.length; ++i) e = e.unionWithRect(t[i]);
        return e
      }, s.prototype = {
        constructor: s,
        toString: function () {
          return "Rect[" + [this.origin.x, this.origin.y, this.size.width, this.size.height].join(", ") + "]"
        },
        copy: function () {
          return new s(this.origin.x, this.origin.y, this.size.width, this.size.height)
        },
        equals: function (t) {
          return this.origin.equals(t.origin) && this.size.equals(t.size)
        },
        inset: function (t, e, i, n) {
          return new s(this.origin.x + t, this.origin.y + e, this.size.width - t - i, this.size.height - e - n)
        },
        pad: function (t) {
          return new s(this.origin.x - t, this.origin.y - t, this.size.width + 2 * t, this.size.height + 2 * t)
        },
        minX: function () {
          return this.origin.x
        },
        minY: function () {
          return this.origin.y
        },
        midX: function () {
          return this.origin.x + this.size.width / 2
        },
        midY: function () {
          return this.origin.y + this.size.height / 2
        },
        maxX: function () {
          return this.origin.x + this.size.width
        },
        maxY: function () {
          return this.origin.y + this.size.height
        },
        intersectionWithRect: function (t) {
          var e = new s,
            i = Math.max(this.minX(), t.minX()),
            n = Math.min(this.maxX(), t.maxX());
          if (i > n) return e;
          var o = Math.max(this.minY(), t.minY()),
            r = Math.min(this.maxY(), t.maxY());
          return o > r || (e.origin.x = i, e.origin.y = o, e.size.width = n - i, e.size.height = r - o), e
        },
        unionWithRect: function (t) {
          var e = Math.min(this.minX(), t.minX()),
            i = Math.min(this.minY(), t.minY());
          return new s(e, i, Math.max(this.maxX(), t.maxX()) - e, Math.max(this.maxY(), t.maxY()) - i)
        },
        round: function () {
          return new s(Math.floor(this.origin.x), Math.floor(this.origin.y), Math.ceil(this.size.width), Math.ceil(this.size.height))
        }
      }
    },
    4140: t => {
      function e(t, e) {
        this.width = t || 0, this.height = e || 0
      }
      t.exports = e, e.Zero = new e, e.prototype = {
        constructor: e,
        toString: function () {
          return "Size[" + this.width + ", " + this.height + "]"
        },
        copy: function () {
          return new e(this.width, this.height)
        },
        equals: function (t) {
          return this.width === t.width && this.height === t.height
        }
      }
    },
    4902: (t, e, i) => {
      var n = i(5650);
      t.exports = {
        GestureRecognizer: n,
        SupportsTouches: n.SupportsTouches,
        SupportsPointerEvents: n.SupportsPointerEvents,
        States: n.States,
        LongPress: i(2707),
        Pan: i(2362),
        Pinch: i(6516),
        Rotation: i(9370),
        Swipe: i(6123),
        Tap: i(9608)
      }
    },
    5650: (t, e, i) => {
      var n = i(7640),
        o = i(210),
        s = i(2936),
        r = i(2114);

      function a() {
        n.EventTarget.call(this), this._targetTouches = [], this._lastKnownEventLocation = null, this._shouldHandleTrackingEvents = !1, this._domEvents = [], this.mode = a.Modes.Adaptive, this._enabled = !0, this._target = null, this.state = a.States.Possible, this.delegate = null
      }
      a.Modes = {
        Adaptive: "adaptive",
        Pointer: "pointer",
        Touch: "touch",
        Mouse: "mouse"
      }, a.SupportsPointerEvents = "PointerEvent" in window, a.SupportsTouches = r.supportsTouches(), a.SupportsGestures = !!window.GestureEvent, a.SupportsGestures ? a.SupportsPointerEvents ? a.UseGesturesForRotation = a.UseGesturesForPinch = !a.SupportsTouches : (a.UseGesturesForRotation = !a.SupportsTouches, a.UseGesturesForPinch = !0) : (a.UseGesturesForRotation = !1, a.UseGesturesForPinch = !1), a.States = {
        Possible: "possible",
        Began: "began",
        Changed: "changed",
        Ended: "ended",
        Cancelled: "cancelled",
        Failed: "failed",
        Recognized: "ended"
      };
      var l = {
        Pointer: {
          Start: "pointerdown",
          Move: "pointermove",
          End: "pointerup",
          Cancel: "pointercancel",
          GestureStart: "gesturestart",
          GestureChange: "gesturechange",
          GestureEnd: "gestureend",
          StateChange: "statechange"
        },
        Touch: {
          Start: "touchstart",
          Move: "touchmove",
          End: "touchend",
          Cancel: "touchcancel",
          GestureStart: "gesturestart",
          GestureChange: "gesturechange",
          GestureEnd: "gestureend",
          StateChange: "statechange"
        },
        Mouse: {
          Start: "mousedown",
          Move: "mousemove",
          End: "mouseup",
          Cancel: void 0,
          GestureStart: "gesturestart",
          GestureChange: "gesturechange",
          GestureEnd: "gestureend",
          StateChange: "statechange"
        }
      };
      a.prototype = Object.create(n.EventTarget.prototype, {
        mode: {
          get: function () {
            return this._mode
          },
          set: function (t) {
            if (this._mode !== t) {
              if (this._targetTouches.length) throw new Error("Cannot switch between modes in the middle of gesture.");
              switch (this._removeBaseListeners(), t) {
                case a.Modes.Adaptive:
                  a.SupportsPointerEvents ? this.events = l.Pointer : a.SupportsTouches ? this.events = l.Touch : this.events = l.Mouse;
                  break;
                case a.Modes.Pointer:
                  this.events = l.Pointer;
                  break;
                case a.Modes.Touch:
                  this.events = l.Touch;
                  break;
                case a.Modes.Mouse:
                  this.events = l.Mouse
              }
              this._mode = t, this._updateBaseListeners()
            }
          }
        },
        currentMode: {
          get: function () {
            if (this._mode === a.Modes.Adaptive) switch (this.events) {
              case l.Pointer:
                return a.Modes.Pointer;
              case l.Touch:
                return a.Modes.Touch;
              case l.Mouse:
                return a.Modes.Mouse
            }
            return this._mode
          }
        },
        target: {
          get: function () {
            return this._target
          },
          set: function (t) {
            this._target !== t && (this._removeBaseListeners(), t && (this._target = t, this._initRecognizer()))
          }
        },
        numberOfTouches: {
          get: function () {
            return this._targetTouches.length
          }
        },
        enabled: {
          get: function () {
            return this._enabled
          },
          set: function (t) {
            this._enabled !== t && (this._enabled = t, t || (0 === this.numberOfTouches ? (this._removeTrackingListeners(), this.reset()) : this.enterCancelledState()), this._updateBaseListeners())
          }
        },
        domEvents: {
          get: function () {
            return this._domEvents
          }
        }
      }), a.prototype.constructor = a, a.prototype.modifierKeys = {
        alt: !1,
        ctrl: !1,
        meta: !1,
        shift: !1
      }, a.prototype.reset = function () { }, a.prototype.preventDefault = function (t) {
        "touchmove" !== t.type && "pointer" !== t.type.substr(0, 7) && t.preventDefault()
      }, a.prototype.locationInElement = function (t) {
        var e = new o,
          i = this._targetTouches;
        if (this._lastKnownEventLocation) e.x = this._lastKnownEventLocation.pageX, e.y = this._lastKnownEventLocation.pageY;
        else {
          for (var n = 0, r = i.length; n < r; ++n) {
            var a = i[n];
            e.x += a.pageX, e.y += a.pageY
          }
          e.x /= r, e.y /= r
        }
        return t ? s.fromPageToElement(t, e) : e
      }, a.prototype.locationInClient = function () {
        var t = new o,
          e = this._targetTouches;
        if (this._lastKnownEventLocation) t.x = this._lastKnownEventLocation.clientX, t.y = this._lastKnownEventLocation.clientY;
        else {
          for (var i = 0, n = e.length; i < n; ++i) {
            var s = e[i];
            t.x += s.clientX, t.y += s.clientY
          }
          t.x /= n, t.y /= n
        }
        return t
      }, a.prototype.locationOfTouchInElement = function (t, e) {
        var i = this._targetTouches[t];
        if (!i) return new o;
        var n = new o(i.pageX, i.pageY);
        return e ? s.fromPageToElement(e, n) : n
      }, a.prototype.useGestures = !1, a.prototype.touchesBegan = function (t) {
        t.currentTarget === this._target && (this._shouldHandleTrackingEvents = !0, window.addEventListener(this.events.Move, this, !0), window.addEventListener(this.events.End, this, !0), this.events.Cancel && window.addEventListener(this.events.Cancel, this, !0), this.enterPossibleState())
      }, a.prototype.touchesMoved = function (t) { }, a.prototype.touchesEnded = function (t) { }, a.prototype.touchesCancelled = function (t) { }, a.prototype.gestureBegan = function (t) {
        t.currentTarget === this._target && (window.addEventListener(this.events.GestureChange, this, !0), window.addEventListener(this.events.GestureEnd, this, !0), this.enterPossibleState())
      }, a.prototype.gestureChanged = function (t) { }, a.prototype.gestureEnded = function (t) { }, a.prototype.enterPossibleState = function () {
        this._setStateAndNotifyOfChange(a.States.Possible)
      }, a.prototype.enterBeganState = function () {
        !this.delegate || "function" != typeof this.delegate.gestureRecognizerShouldBegin || this.delegate.gestureRecognizerShouldBegin(this) ? this._setStateAndNotifyOfChange(a.States.Began) : this.enterFailedState()
      }, a.prototype.enterEndedState = function () {
        this._setStateAndNotifyOfChange(a.States.Ended), this._removeTrackingListeners(), this.reset()
      }, a.prototype.enterCancelledState = function () {
        this._setStateAndNotifyOfChange(a.States.Cancelled), this._removeTrackingListeners(), this.reset()
      }, a.prototype.enterFailedState = function () {
        this._setStateAndNotifyOfChange(a.States.Failed), this._removeTrackingListeners(), this.reset()
      }, a.prototype.enterChangedState = function () {
        this._setStateAndNotifyOfChange(a.States.Changed)
      }, a.prototype.enterRecognizedState = function () {
        this._setStateAndNotifyOfChange(a.States.Recognized)
      }, a.prototype.handleEvent = function (t) {
        this._shouldCountAndHandleTouch(t) && (this._updateTargetTouches(t), this._updateKeyboardModifiers(t), this._handleTouches(t))
      }, a.prototype._handleTouches = function (t) {
        if (this._shouldHandleTouch(t)) switch (t.type) {
          case this.events.Start:
            this.touchesBegan(t);
            break;
          case this.events.Move:
            this.touchesMoved(t);
            break;
          case this.events.End:
            this.touchesEnded(t);
            break;
          case this.events.Cancel:
            this.touchesCancelled(t);
            break;
          case this.events.GestureStart:
            this.gestureBegan(t);
            break;
          case this.events.GestureChange:
            this.gestureChanged(t);
            break;
          case this.events.GestureEnd:
            this.gestureEnded(t)
        }
      }, a.prototype._shouldCountAndHandleTouch = function (t) {
        if (this.events !== l.Pointer || !(t instanceof PointerEvent)) return !0;
        var e = this._targetTouches[0];
        return !e || t.pointerType === e.pointerType || e.pointerId === t.pointerId
      }, a.prototype._shouldHandleTouch = function (t) {
        return this.events !== l.Pointer || (t.type === this.events.Start || t.type === this.events.GestureStart || t.type === this.events.GestureChange || t.type === this.events.GestureEnd || this._shouldHandleTrackingEvents)
      }, a.prototype._initRecognizer = function () {
        this.reset(), this.state = a.States.Possible, this._updateBaseListeners()
      }, a.prototype._removeBaseListeners = function () {
        this._target && (this._target.removeEventListener(this.events.Start, this), this.useGestures && this._target.removeEventListener(this.events.GestureStart, this), this.events === l.Pointer && (this._targetTouches = [], window.removeEventListener(this.events.End, this, !0), window.removeEventListener(this.events.Cancel, this, !0)))
      }, a.prototype._updateBaseListeners = function () {
        this._target && (this._enabled ? (this._target.addEventListener(this.events.Start, this), this.useGestures && this._target.addEventListener(this.events.GestureStart, this), this.events === l.Pointer && (window.addEventListener(this.events.End, this, !0), window.addEventListener(this.events.Cancel, this, !0))) : this._removeBaseListeners())
      }, a.prototype._removeTrackingListeners = function () {
        this._shouldHandleTrackingEvents = !1, window.removeEventListener(this.events.Move, this, !0), this.events !== l.Pointer && (window.removeEventListener(this.events.End, this, !0), window.removeEventListener(this.events.Cancel, this, !0)), window.removeEventListener(this.events.GestureChange, this, !0), window.removeEventListener(this.events.GestureEnd, this, !0)
      }, a.prototype._setStateAndNotifyOfChange = function (t) {
        this.state = t, this.dispatchEvent(new n.Event(this.events.StateChange))
      }, a.prototype._setLastKnownSinglePointLocation = function (t) {
        this._lastKnownEventLocation = {
          clientX: t.clientX,
          clientY: t.clientY,
          pageX: t.pageX,
          pageY: t.pageY
        }
      }, a.prototype._updateTargetTouches = function (t) {
        if (t.type !== this.events.GestureStart && t.type !== this.events.GestureChange && t.type !== this.events.GestureEnd)
          if (this.events !== l.Mouse) {
            var e, i, n;
            if (this.events === l.Touch) {
              if (t.type === this.events.Start) {
                for (this._targetTouches = [], i = 0, n = (e = t.targetTouches).length; i < n; ++i) this._targetTouches.push(e[i]);
                return void (this._lastKnownEventLocation = null)
              }
              if (t.type === this.events.Move) {
                var o = this._targetTouches.map((function (t) {
                  return t.identifier
                }));
                for (this._targetTouches = [], i = 0, n = (e = t.touches).length; i < n; ++i) {
                  var s = e[i]; - 1 !== o.indexOf(s.identifier) && this._targetTouches.push(s)
                }
                return void (this._lastKnownEventLocation = null)
              }
              var r = t.touches,
                a = [];
              for (i = 0, n = r.length; i < n; ++i) a.push(r[i].identifier);
              return this._targetTouches = this._targetTouches.filter((function (t) {
                return -1 !== a.indexOf(t.identifier)
              })), void (0 === this._targetTouches.length ? this._setLastKnownSinglePointLocation(t) : this._lastKnownEventLocation = null)
            }
            if (t.type === this.events.Start) return this._targetTouches.push(t), void (this._lastKnownEventLocation = null);
            if (t.type === this.events.Move) return this._targetTouches = this._targetTouches.map((function (e) {
              return e.pointerId !== t.pointerId ? e : t
            })), void (this._lastKnownEventLocation = null);
            this._targetTouches = this._targetTouches.filter((function (e) {
              return e.pointerId !== t.pointerId
            })), 0 === this._targetTouches.length ? this._setLastKnownSinglePointLocation(t) : this._lastKnownEventLocation = null
          } else t.type === this.events.End ? (this._targetTouches = [], this._setLastKnownSinglePointLocation(t)) : (this._targetTouches = [t], this._lastKnownEventLocation = null);
        else this._setLastKnownSinglePointLocation(t)
      }, a.prototype._updateKeyboardModifiers = function (t) {
        this.modifierKeys.alt = t.altKey, this.modifierKeys.ctrl = t.ctrlKey, this.modifierKeys.meta = t.metaKey, this.modifierKeys.shift = t.shiftKey
      }, a.prototype._distance = function () {
        var t = this._targetTouches[0],
          e = new o(t.pageX, t.pageY),
          i = this._targetTouches[1],
          n = new o(i.pageX, i.pageY);
        return e.distanceToPoint(n)
      }, t.exports = a
    },
    2707: (t, e, i) => {
      var n = i(5650);

      function o() {
        this.allowableMovement = 10, this.minimumPressDuration = 500, this.numberOfTouchesRequired = 1, this.allowsRightMouseButton = !1, n.call(this)
      }
      o.prototype = Object.create(n.prototype), o.prototype.constructor = o, o.prototype.touchesBegan = function (t) {
        t.currentTarget === this.target && (2 !== t.button || this.allowsRightMouseButton) && (n.prototype.touchesBegan.call(this, t), this.numberOfTouches === this.numberOfTouchesRequired ? (this._startPoint = this.locationInElement(), this._timerId = window.setTimeout(this.enterRecognizedState.bind(this), this.minimumPressDuration)) : this.enterFailedState())
      }, o.prototype.touchesMoved = function (t) {
        this.preventDefault(t), this._startPoint.distanceToPoint(this.locationInElement()) > this.allowableMovement && this.enterFailedState()
      }, o.prototype.touchesCancelled = o.prototype.touchesEnded = function (t) {
        this.state === n.States.Recognized ? (this.preventDefault(t), this.numberOfTouches !== this.numberOfTouchesRequired && this.enterFailedState()) : this.enterFailedState()
      }, o.prototype.reset = function () {
        window.clearTimeout(this._timerId), delete this._timerId
      }, t.exports = o
    },
    2362: (t, e, i) => {
      var n = i(5650),
        o = i(210),
        s = .75;

      function r() {
        return {
          start: new o,
          end: new o,
          dt: 0
        }
      }

      function a(t) {
        return t.dt < 1 ? new o : new o((t.end.x - t.start.x) / t.dt * 1e3, (t.end.y - t.start.y) / t.dt * 1e3)
      }

      function l() {
        n.call(this)
      }
      l.prototype = Object.create(n.prototype, {
        velocity: {
          get: function () {
            if (Date.now() - this._lastTouchTime > 100) return new o;
            var t = a(this._velocitySample);
            if (n.SupportsTouches && this._previousVelocitySample.dt > 0) {
              var e = a(this._previousVelocitySample);
              t.x = .25 * t.x + s * e.x, t.y = .25 * t.y + s * e.y
            }
            return t
          }
        }
      }), l.prototype.constructor = l, l.prototype.minimumNumberOfTouches = 1, l.prototype.maximumNumberOfTouches = 1e5, l.prototype.translationThreshold = 10, l.prototype.touchesBegan = function (t) {
        t.currentTarget === this.target && (t instanceof MouseEvent && 0 !== t.button || (n.prototype.touchesBegan.call(this, t), this._numberOfTouchesIsAllowed() ? (this._lastTouchTime = Date.now(), this._resetTrackedLocations(), 1 === this.numberOfTouches && (this._travelledMinimumDistance = !1)) : this.enterFailedState()))
      }, l.prototype.touchesMoved = function (t) {
        this.preventDefault(t);
        var e = Date.now(),
          i = this.locationInElement(),
          n = e - this._lastTouchTime;
        n > 8 && (this._previousVelocitySample.start = this._velocitySample.start.copy(), this._previousVelocitySample.end = this._velocitySample.end.copy(), this._previousVelocitySample.dt = this._velocitySample.dt, this._velocitySample.start = this._lastTouchLocation.copy(), this._velocitySample.end = i, this._velocitySample.dt = n), this._travelledMinimumDistance ? (this.translation.x += i.x - this._lastTouchLocation.x, this.translation.y += i.y - this._lastTouchLocation.y, this.enterChangedState()) : this._canBeginWithTravelledDistance(new o(i.x - this._translationOrigin.x, i.y - this._translationOrigin.y)) && (this._travelledMinimumDistance = !0, this.enterBeganState()), this._lastTouchTime = e, this._lastTouchLocation = i
      }, l.prototype.touchesEnded = function (t) {
        this._numberOfTouchesIsAllowed() ? this._resetTrackedLocations() : this._travelledMinimumDistance ? this.enterEndedState() : this.enterFailedState()
      }, l.prototype.reset = function () {
        this._velocitySample = r(), this._previousVelocitySample = r(), this._gestures = [], this.translation = new o, delete this._travelledMinimumDistance
      }, l.prototype._travelledMinimumDistance = !1, l.prototype._previousVelocitySample = r(), l.prototype._velocitySample = r(), l.prototype._canBeginWithTravelledDistance = function (t) {
        return Math.abs(t.x) >= this.translationThreshold || Math.abs(t.y) >= this.translationThreshold
      }, l.prototype._numberOfTouchesIsAllowed = function () {
        return this.numberOfTouches >= this.minimumNumberOfTouches && this.numberOfTouches <= this.maximumNumberOfTouches
      }, l.prototype._resetTrackedLocations = function () {
        var t = this.locationInElement();
        this._lastTouchLocation = t, this._translationOrigin = t
      }, t.exports = l
    },
    6516: (t, e, i) => {
      var n = i(5650);

      function o() {
        n.call(this)
      }
      o.prototype = Object.create(n.prototype, {
        velocity: {
          get: function () {
            var t = this._gestures[this._gestures.length - 1];
            if (!t) return this._velocity;
            var e = Date.now() - (t.timeStamp + 100);
            if (e <= 0) return this._velocity;
            var i = Math.max((500 - e) / 500, 0);
            return this._velocity * i
          }
        }
      }), o.prototype.constructor = o, o.prototype.scaleThreshold = 0, o.prototype.useGestures = n.UseGesturesForPinch, o.prototype.touchesBegan = function (t) {
        if (t.currentTarget === this.target) {
          if (this.useGestures) {
            if (2 !== this.numberOfTouches) return
          } else {
            if (this.numberOfTouches > 2) return void this.enterFailedState();
            if (2 !== this.numberOfTouches) return;
            this._startDistance = this._distance(), this._recordGesture(1), this._scaledMinimumAmount = !1, this._updateStateWithEvent(t)
          }
          n.prototype.touchesBegan.call(this, t)
        }
      }, o.prototype.touchesMoved = function (t) {
        this.useGestures || 2 === this.numberOfTouches && this._updateStateWithEvent(t)
      }, o.prototype.touchesEnded = function (t) {
        this.useGestures || this.numberOfTouches >= 2 || !this._startDistance || (this._scaledMinimumAmount ? this.enterEndedState() : this.enterFailedState())
      }, o.prototype.gestureBegan = function (t) {
        n.prototype.gestureBegan.call(this, t), this._recordGesture(t.scale), this._scaledMinimumAmount = !1, this._updateStateWithEvent(t), this.preventDefault(t)
      }, o.prototype.gestureChanged = function (t) {
        this.preventDefault(t), this._updateStateWithEvent(t)
      }, o.prototype.gestureEnded = function (t) {
        this._scaledMinimumAmount ? this.enterEndedState() : this.enterFailedState()
      }, o.prototype.reset = function () {
        this.scale = 1, this._velocity = 0, this._gestures = [], delete this._startDistance
      }, o.prototype._scaledMinimumAmount = !1, o.prototype._recordGesture = function (t) {
        var e = Date.now(),
          i = this._gestures.push({
            scale: t,
            timeStamp: e
          });
        if (!(i <= 2)) {
          for (var n = this._gestures[i - 1].scale >= this._gestures[i - 2].scale, o = i - 3; o >= 0; --o) {
            var s = this._gestures[o];
            if (e - s.timeStamp > 100 || this._gestures[o + 1].scale >= s.scale !== n) break
          }
          o > 0 && (this._gestures = this._gestures.slice(o + 1))
        }
      }, o.prototype._updateStateWithEvent = function (t) {
        var e = this.useGestures ? t.scale : this._distance() / this._startDistance;
        if (this._scaledMinimumAmount) {
          this._recordGesture(e);
          var i = this._gestures[0],
            n = e - i.scale,
            o = Date.now() - i.timeStamp;
          this._velocity = 0 === o ? 0 : n / o * 1e3, this.scale *= e / this._gestures[this._gestures.length - 2].scale, this.enterChangedState()
        } else Math.abs(1 - e) >= this.scaleThreshold && (this._scaledMinimumAmount = !0, this.scale = 1, this.enterBeganState())
      }, t.exports = o
    },
    9370: (t, e, i) => {
      var n = i(5650),
        o = i(210);

      function s() {
        n.call(this), this.rotation = 0
      }
      s.prototype = Object.create(n.prototype, {
        velocity: {
          get: function () {
            return this._velocity
          }
        },
        rotation: {
          get: function () {
            return this._rotation
          },
          set: function (t) {
            this._rotation = function (t) {
              for (; t > 180;) t -= 360;
              for (; t < -180;) t += 360;
              return t
            }(t)
          }
        }
      }), s.prototype.constructor = s, s.prototype.useGestures = n.UseGesturesForRotation, s.prototype.touchesBegan = function (t) {
        this.useGestures || t.currentTarget === this.target && 2 === this.numberOfTouches && (n.prototype.touchesBegan.call(this, t), this.numberOfTouches > 2 ? this.enterFailedState() : (this._startAngle = this._angle(), this._startDistance = this._distance(), this.rotation = 0, t.rotation = 0, t.scale = 1, this._lastEvent = t))
      }, s.prototype.touchesMoved = function (t) {
        this.useGestures || 2 === this.numberOfTouches && (t.rotation = this._angle() - this._startAngle, t.scale = this._distance() / this._startDistance, this._handleEvent(t))
      }, s.prototype.touchesEnded = function (t) {
        this.useGestures || this.numberOfTouches >= 2 || null === this._startAngle || (this.state === n.States.Changed ? this.enterEndedState() : this.enterFailedState())
      }, s.prototype.gestureBegan = function (t) {
        this.useGestures && (n.prototype.gestureBegan.call(this, t), this.preventDefault(t), this.rotation = 0, t.rotation = 0, t.scale = 1, this._lastEvent = t)
      }, s.prototype.gestureChanged = function (t) {
        this.useGestures && (this.preventDefault(t), this._handleEvent(t))
      }, s.prototype.gestureEnded = function (t) {
        this.useGestures && this.enterEndedState()
      }, s.prototype.reset = function () {
        this.rotation = 0, this._velocity = 0, this._lastEvent = null, this._startAngle = null
      }, s.prototype._handleEvent = function (t) {
        var e = this._lastEvent,
          i = t.rotation - e.rotation,
          o = t.scale - e.scale,
          s = t.timeStamp - e.timeStamp;
        if (this._lastEvent = t, this.state !== n.States.Possible) s > 0 && (this._velocity = i / s * 1e3), this.rotation += i, this.enterChangedState();
        else {
          var r = Math.abs(t.rotation) < 8,
            a = Math.abs(i / 90) < Math.abs(o),
            l = Math.abs(i) >= 135;
          if (r || a || l) return;
          this.enterBeganState()
        }
      }, s.prototype._angle = function () {
        var t = this._targetTouches[0],
          e = new o(t.pageX, t.pageY),
          i = this._targetTouches[1],
          n = new o(i.pageX, i.pageY);
        return 180 * Math.atan2(e.y - n.y, e.x - n.x) / Math.PI
      }, t.exports = s
    },
    6123: (t, e, i) => {
      var n = i(5650),
        o = i(210),
        s = 100;

      function r() {
        this.numberOfTouchesRequired = 1, this.direction = r.Directions.Right, n.call(this)
      }
      r.Directions = {
        Right: 1,
        Left: 2,
        Up: 4,
        Down: 8
      }, r.prototype = Object.create(n.prototype), r.prototype.constructor = r, r.prototype.touchesBegan = function (t) {
        t.currentTarget === this.target && (this.numberOfTouchesRequired === this.numberOfTouches ? (n.prototype.touchesBegan.call(this, t), this._translationOrigin = this.locationInElement()) : this.enterFailedState())
      }, r.prototype.touchesMoved = function (t) {
        if (this.numberOfTouchesRequired === this.numberOfTouches) {
          this.preventDefault(t);
          var e = this.locationInElement(),
            i = new o(e.x - this._translationOrigin.x, e.y - this._translationOrigin.y);
          this.state !== n.States.Recognized && this.direction === r.Directions.Right && i.x > s && Math.abs(i.x) > Math.abs(i.y) && this.enterRecognizedState(), this.state !== n.States.Recognized && this.direction === r.Directions.Left && i.x < -100 && Math.abs(i.x) > Math.abs(i.y) && this.enterRecognizedState(), this.state !== n.States.Recognized && this.direction === r.Directions.Up && i.y < -100 && Math.abs(i.y) > Math.abs(i.x) && this.enterRecognizedState(), this.state !== n.States.Recognized && this.direction === r.Directions.Down && i.y > s && Math.abs(i.y) > Math.abs(i.x) && this.enterRecognizedState()
        } else this.enterFailedState()
      }, r.prototype.touchesEnded = function (t) {
        this.enterFailedState()
      }, t.exports = r
    },
    9608: (t, e, i) => {
      var n = i(5650),
        o = i(2936),
        s = i(210);

      function r() {
        this.numberOfTapsRequired = 1, this.numberOfTouchesRequired = 1, this.allowsRightMouseButton = !1, n.call(this)
      }
      r.prototype = Object.create(n.prototype), r.prototype.constructor = r, r.prototype.touchesBegan = function (t) {
        t.currentTarget === this.target && (2 !== t.button || this.allowsRightMouseButton) && (n.prototype.touchesBegan.call(this, t), this.numberOfTouches === this.numberOfTouchesRequired ? (this._domEvents.push(t), this._startPoint = n.prototype.locationInElement.call(this), this._startClientPoint = n.prototype.locationInClient.call(this), this._rewindTimer(750)) : this.enterFailedState())
      }, r.prototype.touchesMoved = function (t) {
        var e;
        switch (this.preventDefault(t), this.currentMode) {
          case n.Modes.Pointer:
            e = "touch" === t.pointerType ? 40 : 2;
            break;
          case n.Modes.Touch:
            e = 40;
            break;
          case n.Modes.Mouse:
            e = 2
        }
        this._startPoint.distanceToPoint(n.prototype.locationInElement.call(this)) > e && this.enterFailedState()
      }, r.prototype.touchesEnded = function (t) {
        this._taps++, this._domEvents.push(t), this._taps === this.numberOfTapsRequired && (this.preventDefault(t), this.enterRecognizedState(), this.reset()), this._rewindTimer(350)
      }, r.prototype.reset = function () {
        this._taps = 0, this._clearTimer(), this._domEvents = []
      }, r.prototype.locationInElement = function (t) {
        var e = this._startPoint || new s;
        return t ? o.fromPageToElement(t, e) : e
      }, r.prototype.locationInClient = function () {
        return this._startClientPoint || new s
      }, r.prototype._clearTimer = function () {
        window.clearTimeout(this._timerId), delete this._timerId
      }, r.prototype._rewindTimer = function (t) {
        this._clearTimer(), this._timerId = window.setTimeout(this._timerFired.bind(this), t)
      }, r.prototype._timerFired = function () {
        this.enterFailedState()
      }, t.exports = r
    },
    2114: t => {
      var e = Math.log(2),
        i = [/MSIE [5-9]\./, /Firefox\/[1-9]\./, /Firefox\/[1-2][0-9]\./, /Firefox\/3[0-1]\./, /Firefox\/[0-9]\./, /Firefox\/[1-2][0-9]\./, /Firefox\/3[0-6]\./, /Android [0-3]\./, /Android 4\.[0-3]\./],
        n = [/\(Macintosh; Intel Mac OS X 11_??\)*/, /\(Macintosh; Intel Mac OS X 10.9*\)*/, /\(Macintosh; Intel Mac OS X 10_9*\)*/, /\(Macintosh; Intel Mac OS X 10_??;*\)*/, /\(Macintosh; Intel Mac OS X 10.??;*\)*/, /\(Macintosh; Intel Mac OS X 10_??_*\)*/, /\(Macintosh; Intel Mac OS X 10.??.*\)*/, /\(Macintosh; Intel Mac OS X 10_??\)*/, /\(Macintosh; Intel Mac OS X 10.??\)*/, /iP(hone|od|ad)/],
        o = {
          KeyCodes: {
            Tab: 9,
            Enter: 13,
            Escape: 27,
            SpaceBar: 32,
            LeftArrow: 37,
            UpArrow: 38,
            RightArrow: 39,
            DownArrow: 40
          },
          get iOSVersion() {
            if (/iP(hone|od|ad)/.test(navigator.platform)) {
              var t = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
              return [parseInt(t[1], 10), parseInt(t[2], 10), parseInt(t[3] || 0, 10)]
            }
            return null
          },
          noop: function () { },
          isEdge: function () {
            return /Edge\//i.test(navigator.userAgent)
          },
          isIEAndNotEdge: function () {
            return /MSIE|Trident\//i.test(navigator.userAgent)
          },
          isNode: function () {
            return !1
          },
          isUnsupportedBrowser: function (t) {
            return i.some((function (e) {
              return e.test(t)
            }))
          },
          hasMapsApp: function (t) {
            return n.some((function (e) {
              return e.test(t)
            }))
          },
          mod: function (t, e) {
            return t - e * Math.floor(t / e)
          },
          log2: function (t) {
            return Math.log(t) / e
          },
          clamp: function (t, e, i) {
            return Math.max(e, Math.min(t, i))
          },
          inheritPrototype: function (t, e, i) {
            var n = {
              constructor: {
                enumerable: !0,
                value: e
              }
            };
            return Object.keys(i).forEach((function (t) {
              var e = Object.getOwnPropertyDescriptor(i, t);
              e && (n[t] = e)
            })), Object.create(t.prototype, n)
          },
          checkValueIsInEnum: function (t, e) {
            return Object.keys(e).some((function (i) {
              return e[i] === t
            }))
          },
          required: function (t, e, i) {
            if ("checkNull" in (i = i || {}) || (i.checkNull = !0), void 0 === t || i.checkNull && null === t) throw new Error(e || "Missing parameter");
            return this
          },
          checkType: function (t, e, i) {
            if (typeof t !== e) throw new TypeError(i || "Expected `" + e + "` but got `" + typeof t + "`");
            if ("number" === e && isNaN(t)) throw new TypeError(i || "Expected `" + e + "` but got `NaN`");
            if ("object" === e && t instanceof Array) throw new TypeError(i || "Expected a non-array object but got an array");
            return this
          },
          checkInstance: function (t, e, i) {
            if (!(t instanceof e)) throw new Error(i || "Unexpected object instance");
            return this
          },
          checkElement: function (t, e) {
            if (!this.isElement(t)) throw new Error(e || "Expected an Element");
            return this
          },
          checkArray: function (t, e) {
            if (!Array.isArray(t)) throw new Error(e || "Expected an array");
            return this
          },
          checkOptions: function (t, e) {
            return null != t ? this.checkType(t, "object", e || "[MapKit] The `options` parameter is not a valid object.") : t = {}, t
          },
          isElement: function (t) {
            return t instanceof window.Node && t.nodeType === window.Node.ELEMENT_NODE
          },
          get supportsLocalStorage() {
            if ("_supportsLocalStorage" in this) return this._supportsLocalStorage;
            if (this._supportsLocalStorage = !1, o.isNode()) return !1;
            try {
              if (!window.localStorage) return !1;
              if ("function" != typeof window.localStorage.setItem || "function" != typeof window.localStorage.getItem || "function" != typeof window.localStorage.removeItem) return !1;
              var t = "storageTest";
              if (window.localStorage.setItem(t, t), window.localStorage.getItem(t) !== t) return !1;
              window.localStorage.removeItem(t), this._supportsLocalStorage = !0
            } catch (t) {
              return !1
            }
            return this._supportsLocalStorage
          },
          fillTemplate: function (t, e, i) {
            return t.replace(/{{(.*?)}}/g, (function (t, n) {
              var o = e[n];
              if (i && null == o) throw new Error("fillTemplate: Missing value for parameter: " + n);
              return o
            }))
          },
          generateSrcSetString: function (t) {
            var e = [];
            if (Array.isArray(t) && 3 === t.length)
              for (var i = 0; i < 3; i++) e.push(t[i] + " " + (i + 1) + "x");
            else
              for (var n = t, o = 1; o <= 3; o++) e.push(this.fillTemplate(n, {
                scale: o
              }) + " " + o + "x");
            return e.join(", ")
          },
          xhr: function (t) {
            var e;
            return (e = new XMLHttpRequest).addEventListener("load", t), e.addEventListener("error", t), e.addEventListener("timeout", t), e
          },
          parseURL: function (t) {
            var e = document.createElement("a");
            return e.href = t, e.protocol || (e.protocol = location.protocol), ["href", "protocol", "hostname", "port", "pathname", "search", "hash"].reduce((function (t, i) {
              return t[i] = e[i], t
            }), {})
          },
          toQueryString: function (t, e) {
            return null === t || "object" != typeof t ? "" : (e || Object.keys(t)).reduce((function (e, i) {
              var n = t[i];
              return n && e.push(encodeURIComponent(i) + "=" + encodeURIComponent(n)), e
            }), []).join("&")
          },
          splitStringAtSubStringAndReplace: function (t) {
            var e = [],
              i = t.text.toLowerCase().indexOf(t.subString.toLowerCase());
            if (t.text && !(i < 0) && t.replaceSubString) {
              var n = t.text.substr(0, i);
              n && e.push(t.replacePre ? t.replacePre(n) : n);
              var o = t.text.substr(i, t.subString.length);
              e.push(t.replaceSubString(t.subString, o));
              var s = t.text.substr(i + t.subString.length);
              return s && e.push(t.replacePost ? t.replacePost(s) : s), e
            }
          },
          isSameOrigin: function (t, e) {
            return t = this.parseURL(t), e = this.parseURL(e), t.hostname === e.hostname && t.protocol === e.protocol
          },
          capitalize: function (t) {
            return t ? t[0].toUpperCase() + t.substr(1).toLowerCase() : t
          },
          generateSessionIdValue: function () {
            return Math.floor(1e15 * (9 * Math.random() + 1))
          },
          doNotTrack: function () {
            var t = window && (window.navigator && (navigator.doNotTrack || navigator.msDoNotTrack) || window.doNotTrack);
            return "1" === t || "yes" === t
          },
          supportsTouches: function () {
            return "ontouchmove" in document
          },
          isSpaceKey: function (t) {
            return t.keyCode === this.KeyCodes.SpaceBar
          },
          isEnterKey: function (t) {
            return t.keyCode === this.KeyCodes.Enter
          },
          isTabKey: function (t) {
            return t.keyCode === this.KeyCodes.Tab
          },
          isEscapeKey: function (t) {
            return t.keyCode === this.KeyCodes.Escape
          },
          createCanvas: function () {
            return document.createElement("canvas")
          },
          atob: function (t) {
            return window.atob(t)
          }
        };
      t.exports = o
    },
    8877: (t, e, i) => {
      t.exports = {
        Priority: i(7531),
        State: i(4791),
        Loader: i(9657),
        ImageLoader: i(3161),
        XHRLoader: i(9602)
      }
    },
    3161: (t, e, i) => {
      var n = i(2114),
        o = i(9657);

      function s(t, e) {
        o.call(this, t, e), this._image = null
      }
      s.prototype = n.inheritPrototype(o, s, {
        get image() {
          return this._image
        },
        get url() {
          return this._image.src
        },
        reuse: function (t, e) {
          this.init(t, e)
        },
        crossOrigin: null,
        loaderWillStart: function () {
          o.prototype.loaderWillStart.call(this), this._image || (this._image = document.createElement("img")), this._image.crossOrigin = this.crossOrigin, this._image.src = this._delegate.urlForImageLoader, this._image.addEventListener("load", this), this._image.addEventListener("error", this)
        },
        handleEvent: function (t) {
          switch (t.type) {
            case "error":
              this.loaderDidFail(t.target);
              break;
            case "load":
              this.loaderDidSucceed()
          }
        },
        _reset: function () {
          this._image && (this._image.removeEventListener("load", this), this._image.removeEventListener("error", this)), o.prototype._reset.call(this)
        }
      }), t.exports = s
    },
    9657: (t, e, i) => {
      var n = i(618),
        o = i(4791);

      function s(t, e) {
        this.init(t, e)
      }
      s.prototype = {
        constructor: s,
        get state() {
          return this._state
        },
        schedule: function () {
          this._state || (this._state = o.Waiting, n.schedule(this))
        },
        unschedule: function () {
          var t = !1;
          if (this._state === o.Waiting) t = n.unschedule(this);
          else {
            if (this._state !== o.Loading) return !1;
            n.loaderDidComplete(this), t = !0
          }
          return this._unscheduled = t, this._state = o.Canceled, "function" == typeof this._delegate.loaderDidCancel && this._delegate.loaderDidCancel(this), this._reset(), t
        },
        loaderWillStart: function () {
          this._state = o.Loading, "function" == typeof this._delegate.loaderWillStart && this._delegate.loaderWillStart(this)
        },
        loaderDidSucceed: function (t) {
          this._state = o.Succeeded, n.loaderDidComplete(this), "function" == typeof this._delegate.loaderDidSucceed && this._delegate.loaderDidSucceed(this, t), this._reset()
        },
        loaderDidFail: function (t) {
          this._state = o.Failed, n.loaderDidComplete(this), "function" == typeof this._delegate.loaderDidFail && this._delegate.loaderDidFail(this, t), this._reset()
        },
        init: function (t, e) {
          this._delegate = e, this._state = o.Unscheduled, this._retries = 0, this._timeoutID = -1, this.priority = t, this._unscheduled = !1
        },
        _reset: function () {
          clearTimeout(this._timeoutID)
        },
        _reload: function () {
          if (this._retries++, this._retries < 3) {
            var t = "number" == typeof this._delay ? this._delay : 1e4;
            this._timeoutID = setTimeout(this.loaderWillStart.bind(this), t)
          } else this.loaderDidFail()
        }
      }, t.exports = s
    },
    618: (t, e, i) => {
      var n = i(7531),
        o = [];
      o[n.Highest] = 12, o[n.High] = 12, o[n.Medium] = 4, o[n.Low] = 1;
      var s = [],
        r = [];
      for (var a in n) s[n[a]] = [], r[n[a]] = 0;

      function l() {
        for (var t in n) {
          if (s[n[t]].length > 0) {
            if (r[n[t]] === o[n[t]]) break;
            return s[n[t]][0]
          }
          if (r[n[t]] > 0) break
        }
        return null
      }

      function h() {
        for (var t in n)
          if (s[n[t]].length > 0) return s[n[t]].shift(), !0;
        return !1
      }

      function c() {
        for (var t = l(); t;) r[t.priority]++, h(), t.loaderWillStart(), t = l()
      }
      t.exports = {
        schedule: function (t) {
          s[t.priority].push(t), c()
        },
        unschedule: function (t) {
          return function (t) {
            for (var e in n) {
              var i = s[n[e]].indexOf(t);
              if (-1 !== i) return s[n[e]].splice(i, 1), !0
            }
            return !1
          }(t)
        },
        loaderDidComplete: function (t) {
          r[t.priority]--, c()
        }
      }
    },
    7531: t => {
      t.exports = {
        Highest: 0,
        High: 1,
        Medium: 2,
        Low: 3
      }
    },
    4791: t => {
      t.exports = {
        Unscheduled: 0,
        Waiting: 1,
        Loading: 2,
        Canceled: 3,
        Succeeded: 4,
        Failed: 5
      }
    },
    9602: (t, e, i) => {
      var n = i(2114),
        o = i(9657),
        s = i(7531);

      function r(t, e, i) {
        var r = (i = i || {}).priority || s.Highest;
        o.call(this, r, e), this._url = t, this._method = i.method || "GET", this._retry = !0 === i.retry, this._delay = i.delay, this._headers = i.headers, this._timeout = i.timeout, this._withCredentials = i.withCredentials, n.isNode() && (this._origin = i.origin)
      }
      r.prototype = n.inheritPrototype(o, r, {
        get xhrData() {
          return this._xhrData
        },
        unschedule: function () {
          return this._xhr && this._xhr.abort(), o.prototype.unschedule.call(this)
        },
        loaderWillStart: function () {
          if (o.prototype.loaderWillStart.call(this), this._xhr = n.xhr(this), this._xhr.open(this._method, this._url, !0), this._xhr.timeout = this._timeout, this._xhr.withCredentials = this._withCredentials, this._origin && (this._xhr.setDisableHeaderCheck(!0), this._xhr.setRequestHeader("Origin", this._origin)), this._headers && Object.keys(this._headers).forEach((function (t) {
            this._xhr.setRequestHeader(t, this._headers[t])
          }), this), "POST" === this._method && !this._xhrData) {
            if (this._xhrData = this._delegate.getDataToSend(this._xhr), !this._xhrData) return;
            0
          }
          this._xhr.send(this._xhrData)
        },
        handleEvent: function (t) {
          "error" === t.type || "timeout" === t.type || 200 !== t.target.status ? this._retry ? o.prototype._reload.call(this) : this.loaderDidFail(t.target) : "load" === t.type ? this.loaderDidSucceed(t.target) : console.log("Unhandled XHR event type:", t.type, " status:", t.target.status)
        }
      }), t.exports = r
    },
    5239: (t, e, i) => {
      "use strict";
      t.exports = {
        LangTag: i(8283),
        Locale: i(1761),
        LanguageSupport: i(6665),
        L10n: i(6631),
        UseMetric: i(3723),
        localizeDigits: i(2978)
      }
    },
    6631: (t, e, i) => {
      "use strict";
      var n = i(7640),
        o = i(1761),
        s = i(8283),
        r = i(7585),
        a = i(2978),
        l = "en-US";

      function h(t, e, i) {
        return new o(e, i, t.delegate, t.dowForBestMatch(e))
      }

      function c(t, e) {
        t.locales[e.localeId] || (t.locales[e.localeId] = e), t.activeLocale = e;
        var i = new n.Event(d.Events.LocaleChanged);
        i.locale = e, t.dispatchEvent(i)
      }

      function d(t) {
        var e;
        this.delegate = t, this.locales = t.localesCache || Object.create(null), this.supportMap = t.supportCache || Object.create(null), this.scriptMap = t.scriptCache || Object.create(null), c(this, this.locales[l] || h(this, l, this.delegate.enUSDictionary)), (e = this).supportMap._built || (e.supportMap._built = !0, e.delegate.supportedLocales.forEach((function (t) {
          var i = s.parse(t);
          ! function (t, e) {
            var i = e.language,
              n = e.region;
            t.supportMap[i] || (t.supportMap[i] = []), -1 !== t.delegate.primaryLocales.indexOf(e.tag) ? t.supportMap[i].splice(0, 0, n) : t.supportMap[i].push(n)
          }(e, i)
        }))),
          function (t) {
            t.scriptMap._built || (t.scriptMap._built = !0, Object.keys(t.delegate.regionToScriptMap).forEach((function (e) {
              t.scriptMap[e] = Object.create(null), Object.keys(t.delegate.regionToScriptMap[e]).forEach((function (i) {
                var n = t.delegate.regionToScriptMap[e][i].toLowerCase();
                t.scriptMap[e][n] = i
              }))
            })))
          }(this)
      }
      d.Events = {
        LocaleChanged: "locale-changed"
      }, d.Days = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6
      }, d.prototype = {
        constructor: d,
        Events: d.Events,
        get: function (t, e) {
          return this.activeLocale.get(t, e)
        },
        get localeId() {
          return this.activeLocale.localeId
        },
        set localeId(t) {
          this._requestedLocaleId !== t && function (t, e) {
            t._requestedLocaleId = e;
            var i = e;
            if (function (t, e) {
              return -1 !== t.delegate.supportedLocales.indexOf(e)
            }(t, e) || (i = t.bestMatch(e, l)), !t.activeLocale || t.activeLocale.localeId !== i) {
              var n = t.locales[i];
              n || (n = h(t, i)).ready ? c(t, n) : n.load((function (i, n) {
                if (t._requestedLocaleId === e) return i ? (t._requestedLocaleId = l, void c(t, t.locales[l])) : void c(t, n)
              }))
            }
          }(this, t)
        },
        get loaded() {
          return this._requestedLocaleId && this.bestMatch(this._requestedLocaleId, l) === this.localeId
        },
        get requestedLocaleId() {
          return this._requestedLocaleId
        },
        set requestedLocaleId(t) {
          console.warn("l10n: requestedLocaleId can't be set, use localeId.")
        },
        get localeIds() {
          return Object.keys(this.locales)
        },
        get supportedLocaleIds() {
          return this.delegate.supportedLocales
        },
        bestMatch: function (t, e) {
          var i = s.parse(t),
            n = null;
          if (i && this.delegate.localesMap) {
            var o = this.delegate.localesMap;
            o[i.tag] ? i = s.parse(o[i.tag]) : o[i.language] && (i = s.parse(o[i.language]))
          }
          return e = e || null, i && (n = function (t, e) {
            var i, n = e.language,
              o = e.region,
              r = e.script,
              a = t.supportMap[n];
            if (!a) return null;
            if (o && (i = a.filter((function (t) {
              return t.toUpperCase() === e.region.toUpperCase()
            }))[0]), !i && r) {
              var l = t.scriptMap[n];
              l && (i = l[r.toLowerCase()])
            }
            return i || (i = a[0]), new s(n, i)
          }(this, i)), n ? n.tag : e
        },
        dowForBestMatch: function (t, e) {
          return r[this.bestMatch(t, e)]
        },
        digits: function (t) {
          return a(t, this.localeId)
        }
      }, n.EventTarget(d.prototype), t.exports = d
    },
    8283: (t, e, i) => {
      "use strict";
      var n = i(2114);

      function o(t, e, i) {
        this.language = t.toLowerCase(), e && (this.region = e.toUpperCase()), i && (this.script = n.capitalize(i))
      }
      o.prototype = {
        constructor: o,
        get tag() {
          var t = this.language;
          return this.region ? t + "-" + this.region : this.script ? t + "-" + this.script : t
        },
        toString: function () {
          var t = "{ language: " + this.language;
          return this.region && (t += ", region: " + this.region), this.script && (t += ", script: " + this.script), t + " }"
        }
      }, o.parse = function (t) {
        var e, i, n;
        if (t && "string" == typeof t) {
          if (-1 !== t.indexOf("_")) return console.warn("Invalid character: '_'"), null;
          var s = t.split("-");
          if ((e = s[0]).length < 2 || e.length > 4) return console.warn("Invalid language:", t), null;
          if (!(s.length < 4)) return console.warn("Don't know how to parse language tags with more than 3 parts:", t), null;
          for (var r = 1; r < s.length; r++) {
            var a = s[r];
            if (4 === a.length) n = a;
            else {
              if (!(a.length > 1 && a.length < 4)) return console.warn("Don't know how to parse:", t), null;
              i = a
            }
          }
          return new o(e, i, n)
        }
        return null
      }, t.exports = o
    },
    6665: (t, e, i) => {
      "use strict";
      var n = i(8283);

      function o(t) {
        this.supportMap = Object.create(null), this.delegate = t, this.delegate.supportedLocales.forEach((function (t) {
          ! function (t, e) {
            var i = t.language,
              n = t.region,
              o = t.script;
            e[i] || (e[i] = {
              regions: [],
              scripts: []
            }), n && e[i].regions.push(n), o && e[i].scripts.push(o)
          }(n.parse(t), this.supportMap)
        }), this)
      }
      o.prototype = {
        constructor: o,
        bestMatch: function (t, e) {
          var i = n.parse(t),
            o = null;
          if (i && this.delegate.localesMap) {
            var s = this.delegate.localesMap;
            s[i.tag] ? i = n.parse(s[i.tag]) : s[i.language] && (i = n.parse(s[i.language]))
          }
          return e = e || null, i && (o = function (t, e, i) {
            var o = t.language,
              s = t.region,
              r = t.script,
              a = i[o];
            if (!a) return null;
            if (s) {
              var l = a.regions.filter((function (e) {
                return e.toUpperCase() === t.region.toUpperCase()
              }))[0];
              if (l) return new n(o, l);
              var h = e[o];
              h && h[s.toUpperCase()] && (t.script = r = h[s.toUpperCase()])
            }
            if (r) {
              var c = a.scripts.filter((function (e) {
                return e.toUpperCase() === t.script.toUpperCase()
              }))[0];
              return new n(o, null, c)
            }
            return new n(o)
          }(i, this.delegate.regionToScriptMap, this.supportMap)), o ? o.tag : e
        }
      }, o.parseAcceptLanguage = function (t) {
        return t ? t.split(",").map((function (t) {
          if (!t) return null;
          var e = t.split(";");
          return {
            langTag: n.parse(e[0]),
            quality: e[1] ? parseFloat(e[1].split("=")[1]) : 1
          }
        })).filter((function (t) {
          return !!t
        })).sort((function (t, e) {
          return e.quality - t.quality
        })) : null
      }, t.exports = o
    },
    1761: (t, e, i) => {
      "use strict";
      var n = i(2114),
        o = i(8877).XHRLoader;

      function s(t, e, i, n) {
        this.localeId = t, this._dict = e || {}, this.ready = !!e, this.delegate = i, this.rtl = i.rtlLocales.indexOf(t) > -1, this.dow = n
      }
      s.prototype = {
        constructor: s,
        get: function (t, e) {
          var i = this._dict[t];
          return i ? (e = e || {}, n.fillTemplate(i, e, !0)) : "[" + t + "]"
        },
        load: function (t) {
          var e = this.delegate.localeUrl,
            i = this,
            n = e.replace(/{{(.*?)}}/, this.localeId);
          new o(n, {
            loaderDidSucceed: function (e, n) {
              var o;
              if (n.status < 200 || n.status >= 300) return o = "HTTP error " + n.status + " loading strings for locale: " + i.localeId, void t(new Error(o));
              try {
                i._dict = JSON.parse(n.responseText)
              } catch (e) {
                return o = "Failed to parse response for locale: " + i.localeId, void t(new Error(o))
              }
              i.ready = !0, t(null, i)
            },
            loaderDidFail: function (e, n) {
              var o = "Network error loading strings for locale: " + i.localeId;
              t(new Error(o))
            }
          }, {
            withCredentials: this.delegate.withCredentials
          }).schedule()
        }
      }, t.exports = s
    },
    2978: t => {
      var e = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        i = {
          "ar-SA": ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],
          "hi-IN": ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
        },
        n = ",",
        o = {
          "ca-ES": n,
          "ca-CZ": n,
          "da-DK": n,
          "da-DE": n,
          "el-GR": n,
          "en-ZA": n,
          "es-ES": n,
          "fi-FI": n,
          "fr-CA": n,
          "fr-FR": n,
          "hr-HR": n,
          "hu-HU": n,
          "it-IT": n,
          "nb-NO": n,
          "nl-NL": n,
          "pl-PL": n,
          "pt-BR": n,
          "pt-PT": n,
          "ro-RO": n,
          "ru-RU": n,
          "sk-SK": n,
          "sv-SE": n,
          "tr-TR": n,
          "uk-UA": n
        };
      t.exports = function (t, n) {
        for (var s = i[n] || e, r = o[n] || ".", a = "", l = t.toString(), h = 0, c = l.length; h < c; ++h) {
          var d = l.charAt(h);
          a += "." === d ? r : s[parseInt(d, 10)] || d
        }
        return a
      }
    },
    3723: t => {
      "use strict";
      var e = ["AS", "BS", "BZ", "DM", "FK", "GB", "GD", "GU", "KN", "KY", "LC", "LR", "MM", "MP", "SH", "TC", "US", "VC", "VG", "VI", "WS"];
      t.exports = {
        forRegion: function (t) {
          return !!t && e.indexOf(t) < 0
        },
        forLanguageTag: function (t) {
          var i = t.region;
          return i ? e.indexOf(i) < 0 : "en" !== t.language && "my" !== t.language
        }
      }
    },
    270: (t, e, i) => {
      var n, o = i(7640),
        s = i(4140),
        r = i(210),
        a = i(9477),
        l = i(2114),
        h = i(4937),
        c = i(2936),
        d = [],
        u = [],
        p = 0,
        m = 1,
        g = 2,
        _ = 3,
        f = ((n = document.createElement("div")).style.msTransform = "translate3d(2px, 2px, 2px)", "none" !== window.getComputedStyle(n).msTransform);

      function y() {
        this._parent = null, this._children = []
      }

      function v(t) {
        y.call(this), this.shadowRootMode = t
      }

      function w(t) {
        var e;
        t ? (e = t) instanceof window.Node && e.nodeType === window.Node.ELEMENT_NODE ? this.domNode = t : "string" == typeof t || t instanceof String ? this.domNode = function (t) {
          var e = document.createElement("div");
          return e.innerHTML = t, e.firstElementChild
        }(t) : "object" == typeof t && (this.domNode = M(t)) : this.domNode = document.createElement("div"), y.call(this), this._opacity = 1, this._color = "", this._size = new s, this._position = new r, this._transform = new a, this._backgroundImages = [], this._classList = new x(this), this._wantsHardwareCompositing = !1, this._dirtyAttributes = {}, this._dirtyProperties = [], this._pendingDOMManipulation = p
      }

      function b() {
        d.forEach(C), d = [], u.forEach(k), u = [], w.updates++, A.dispatchEvent(new o.Event("update"))
      }

      function C(t) {
        if (t._pendingDOMManipulation === m) {
          var e = t.domNode.parentNode;
          e && e.removeChild(t.domNode)
        }
        t._dirtyProperties && (t._dirtyProperties.forEach((function (e) {
          ! function (t, e) {
            var i = t.domNode,
              n = i.style;
            switch (e) {
              case "opacity":
                n.opacity = t._opacity;
                break;
              case "color":
                n.color = t._color;
                break;
              case "size":
                n.width = t._size.width + "px", n.height = t._size.height + "px";
                break;
              case "position":
              case "transform":
                var o = (new a).translate(S(t._position.x), S(t._position.y)).transform(t._transform);
                f && t._wantsHardwareCompositing && o.rotate3d(0, 0, 0, 0), n.transform = n.webkitTransform = n.msTransform = o;
                break;
              case "backgroundImages":
                ! function (t) {
                  var e = t.domNode.style;
                  if (!t._backgroundImages.length) return e.removeProperty("background-image"), e.removeProperty("background-position"), void e.removeProperty("background-size");
                  for (var i = [], n = [], o = [], s = t._backgroundImages, r = s.length - 1; r >= 0; --r) {
                    var a = s[r];
                    i.push("url(" + a.url + ")"), n.push(a.position.x + "px " + a.position.y + "px"), o.push(a.size.width + "px " + a.size.height + "px")
                  }
                  e.backgroundImage = i.join(","), e.backgroundPosition = n.join(","), e.backgroundSize = o.join(",")
                }(t);
                break;
              case "classList":
                i.setAttribute("class", t._classList), t._classList.reset();
                break;
              default:
                ;
            }
          }(t, e)
        })), t._dirtyProperties = []), t._dirtyAttributes && (Object.getOwnPropertyNames(t._dirtyAttributes).forEach((function (e) {
          t.domNode.setAttribute(e, t._dirtyAttributes[e])
        })), t._dirtyAttributes = {}), t._pendingDOMManipulation !== g && t._pendingDOMManipulation !== _ || E(u, t.parent)
      }

      function k(t) {
        for (var e = null, i = t.domNode, n = t.children.length - 1; n >= 0; --n) {
          var o = t.children[n],
            s = o.domNode;
          switch (o._pendingDOMManipulation) {
            case g:
              i.insertBefore(s, e), o._pendingDOMManipulation = p;
              break;
            case _:
              var r = i.attachShadow({
                mode: o.shadowRootMode
              });
              o.domNode = r, o._pendingDOMManipulation = p
          }
          e = s
        }
      }

      function S(t) {
        var e = Math.max(Math.round(window.devicePixelRatio), 1);
        return Math.round(t * e) / e
      }

      function M(t) {
        var e = t.name;
        if ("#text" === e) return document.createTextNode(t.value);
        var i = document.createElement(e),
          n = t.attributes;
        for (var o in n) i.setAttribute(o, n[o]);
        return t.children instanceof Array && t.children.forEach((function (t) {
          i.appendChild(M(t))
        })), i
      }

      function E(t, e) {
        return -1 === t.indexOf(e) && (t.push(e), !0)
      }

      function L(t, e) {
        var i = t.indexOf(e);
        return -1 !== i && (t.splice(i, 1), !0)
      }

      function T(t, e, i, n) {
        var o = "";
        o += e, n && (o += function (t) {
          return t < 0 ? "" : t + ":"
        }(i)), o += t.toString(), o += function (t) {
          return t.childCount < 1 ? "" : " ⤵︎ " + t.childCount
        }(t);
        for (var s = t.children, r = 0, a = s.length; r < a; ++r) {
          var l = t.childCount < 1 ? -1 : r;
          o += "\n", o += T(s[r], e + "    ", l, n)
        }
        return o
      }

      function x(t) {
        this._node = t, this.reset()
      }
      y.prototype = {
        constructor: w,
        domNode: null,
        nodeIsShadowRoot: !1,
        get parent() {
          return this._parent
        },
        get children() {
          return this._children
        },
        set children(t) {
          for (var e = this._children; e.length;) this.removeChild(e[0]);
          t.forEach((function (t) {
            this.addChild(t)
          }), this)
        },
        get childCount() {
          return this._children.length
        },
        get firstChild() {
          return this._children[0] || null
        },
        get lastChild() {
          return this._children[this._children.length - 1] || null
        },
        get previousSibling() {
          if (!this._parent) return null;
          var t = this._parent._children,
            e = t.indexOf(this);
          return e > 0 ? t[e - 1] : null
        },
        get nextSibling() {
          if (!this._parent) return null;
          var t = this._parent._children,
            e = t.indexOf(this);
          return -1 !== e && e < t.length - 1 ? t[e + 1] : null
        },
        addChild: function (t, e) {
          if (0 === e && this._children[0] && this._children[0].nodeIsShadowRoot) throw new TypeError("RenderTree.RenderNode.addChild: Node cannot insert before shadow root node.");
          return t.willMoveToParent(this), t._doNotNotifyParentChange = !0, t.remove(), delete t._doNotNotifyParentChange, (void 0 === e || e < 0 || e > this._children.length) && (e = this._children.length), this._children.splice(e, 0, t), t._parent = this, t.didMoveToParent(this), this.didAddChild(t), t._markNodeManipulation(g), t
        },
        insertBefore: function (t, e) {
          return this.addChild(t, this._children.indexOf(e))
        },
        insertAfter: function (t, e) {
          var i = this._children.indexOf(e);
          return this.addChild(t, -1 !== i ? i + 1 : 0)
        },
        removeChild: function (t) {
          if (t._parent === this) {
            var e = this._children.indexOf(t);
            if (-1 !== e) {
              if (t.nodeIsShadowRoot) throw new TypeError("RenderTree.RenderNode: Not supported in ShadowRoot-backed RenderNode.");
              return this.willRemoveChild(t), t._doNotNotifyParentChange || t.willMoveToParent(null), this._children.splice(e, 1), t._parent = null, t._doNotNotifyParentChange || t.didMoveToParent(null), t._markNodeManipulation(m), t
            }
          }
        },
        remove: function () {
          if (this._parent instanceof y) return this._parent.removeChild(this)
        },
        findNode: function (t, e) {
          if ("function" != typeof t) throw new TypeError("RenderTree.RenderNode.findNode: callback must be a function");
          var i, n = this;
          return function o(s) {
            s !== n && t.call(e, s) ? i = s : s.children.some((function (t) {
              return o(t), i
            }))
          }(n), i
        },
        dump: function (t) {
          return T(this, "", -1, t)
        },
        willRemoveChild: function (t) { },
        didAddChild: function (t) { },
        willMoveToParent: function (t) { },
        didMoveToParent: function (t) { },
        _markDirtyProperty: function (t, e) {
          (void 0 === e || e ? E(this._dirtyProperties, t) : L(this._dirtyProperties, t)) && this._updateNodeDirtiness()
        },
        _markNodeManipulation: function (t) {
          this._pendingDOMManipulation = t, this._updateNodeDirtiness()
        },
        _updateNodeDirtiness: function () {
          var t;
          t = this, this._pendingDOMManipulation !== p || this._dirtyProperties.length > 0 || Object.getOwnPropertyNames(this._dirtyAttributes).length > 0 ? (E(d, t), h.scheduleDraw(b)) : L(d, t)
        }
      }, v.prototype = l.inheritPrototype(y, v, {
        nodeIsShadowRoot: !0,
        shadowRootMode: void 0,
        toString: function () {
          return this.stringInfo() + " [" + this.shadowRootMode + "]"
        },
        stringInfo: function () {
          return "#shadow-root"
        }
      }), w.prototype = l.inheritPrototype(y, w, {
        get element() {
          return this.domNode
        },
        set element(t) {
          this.domNode = t
        },
        get classList() {
          return this._classList
        },
        get wantsHardwareCompositing() {
          return this._wantsHardwareCompositing
        },
        set wantsHardwareCompositing(t) {
          t !== this._wantsHardwareCompositing && (this._wantsHardwareCompositing = t, this._markDirtyProperty("transform"))
        },
        get opacity() {
          return this._opacity
        },
        set opacity(t) {
          (t = Math.min(Math.max(0, t), 1)) !== this._opacity && (this._opacity = t, this._markDirtyProperty("opacity"))
        },
        get color() {
          return this._color
        },
        set color(t) {
          t !== this._color && (this._color = t, this._markDirtyProperty("color"))
        },
        get position() {
          return this._position
        },
        set position(t) {
          this._position = t, this._markDirtyProperty("position")
        },
        get transform() {
          return this._transform
        },
        set transform(t) {
          this._transform = t, this._markDirtyProperty("transform")
        },
        get backgroundImages() {
          return this._backgroundImages
        },
        set backgroundImages(t) {
          this._backgroundImages = t || [], this._markDirtyProperty("backgroundImages")
        },
        get size() {
          return this._size
        },
        set size(t) {
          this._size = t || new s, this._markDirtyProperty("size")
        },
        setAttribute: function (t, e) {
          this._dirtyAttributes[t] = e, this._updateNodeDirtiness()
        },
        createAndAddShadowRootChild: function (t) {
          if (this._children[0] && this._children[0].nodeIsShadowRoot) throw new Error("RenderTree.RenderNode.createAndAddShadowRootChild: Cannot add more than one shadow root.");
          var e = new v(t || "closed");
          return this._children.unshift(e), e._parent = this, this.didAddChild(e), e._markNodeManipulation(_), e
        },
        convertPointFromPage: function (t) {
          return c.fromPageToElement(this.domNode, t)
        },
        convertPointToPage: function (t) {
          return c.fromElementToPage(this.domNode, t)
        },
        toString: function () {
          var t = "";
          return this._wantsHardwareCompositing && (t += "🏁 "), t += this.stringInfo(), this.classList.toString() && (t += this.classList._classes().map((function (t) {
            return "." + t
          })).join(", ")), 0 === this.position.x && 0 === this.position.y || (t += " (" + this.position.x + ", " + this.position.y + ")"), 0 === this.size.width && 0 === this.size.height || (t += " " + this.size.width + "x" + this.size.height), 1 !== this.opacity && (t += " [opacity:" + this.opacity + "]"), this.transform.toString() && (t += " [" + this.transform.toString() + "]"), t
        },
        stringInfo: function () {
          return "<" + this.domNode.tagName.toLowerCase() + ">"
        }
      }), w.updates = 0, x.prototype = {
        constructor: x,
        add: function (t) {
          this._add(t)
        },
        remove: function (t) {
          this._remove(t)
        },
        contains: function (t) {
          return -1 !== this._classes().indexOf(t)
        },
        toggle: function (t, e) {
          if (arguments.length > 1) return e ? this._add(t) : this._remove(t), !!e;
          this._add(t) || this._remove(t)
        },
        toString: function () {
          return this._classes().join(" ")
        },
        _classes: function () {
          if (this._populateClasses) {
            var t = this._node.domNode.className;
            "string" == typeof t.baseVal && (t = t.baseVal), this.__classes = t.split(/[ ]+/).filter(Boolean), delete this._populateClasses
          }
          return this.__classes
        },
        reset: function () {
          this._additions = [], this._removals = [], this.__classes = [], this._populateClasses = !0
        },
        _add: function (t) {
          if (!t) return !1;
          var e = E(this._classes(), t);
          return e && (L(this._removals, t) || E(this._additions, t), this._updateNodeDirtiness()), e
        },
        _remove: function (t) {
          if (!t) return !1;
          var e = L(this._classes(), t);
          return e && (L(this._additions, t) || E(this._removals, t), this._updateNodeDirtiness()), e
        },
        _updateNodeDirtiness: function () {
          this._node._markDirtyProperty("classList", this._additions.length > 0 || this._removals.length > 0)
        }
      };
      var A = new o.EventTarget;
      A.Node = w, A.Point = r, A.Transform = a, t.exports = A
    },
    4937: (t, e, i) => {
      var n = i(7809),
        o = i(2235),
        s = -1,
        r = [],
        a = [],
        l = [],
        h = 0,
        c = 1,
        d = 2,
        u = 3,
        p = h;

      function m() {
        -1 === s && (r.length > 0 || l.length > 0) && (s = window.requestAnimationFrame(g))
      }

      function g() {
        p === u && -1 !== s && window.cancelAnimationFrame(s),
          function () {
            p = c;
            for (; r.length > 0;) {
              var t = r;
              r = [];
              for (var e = 0, i = t.length; e < i; ++e) {
                var n = t[e];
                "function" == typeof n ? n() : n && "object" == typeof n && "function" == typeof n.performScheduledUpdate && n.performScheduledUpdate()
              }
            }
            r = a, a = []
          }(),
          function () {
            p = d;
            var t = l;
            l = [];
            for (var e = 0, i = t.length; e < i; ++e) {
              var n = t[e];
              "function" == typeof n ? n() : n && "object" == typeof n && "function" == typeof n.performScheduledDraw && n.performScheduledDraw()
            }
          }(), p = h, s = -1, m()
      }

      function _(t, e) {
        return -1 === t.indexOf(e) && (t.push(e), !0)
      }
      t.exports = {
        scheduleASAP: function (t) {
          _(r, t) && m()
        },
        scheduleOnNextFrame: function (t) {
          _(p === c ? a : r, t) && m()
        },
        scheduleDraw: function (t) {
          _(l, t) && m()
        },
        flush: function () {
          p > h || (p = u, g())
        },
        Priority: o,
        scheduleInBackground: function (t, e) {
          n.schedule(t, e || o.Low)
        }
      }
    },
    7809: (t, e, i) => {
      var n = i(546),
        o = i(2235),
        s = [{
          timeout: 600
        }, {
          timeout: 1e3
        }, {
          timeout: 3e3
        }, {}],
        r = [function (t) {
          c(t, o.Highest)
        }, function (t) {
          c(t, o.High)
        }, function (t) {
          c(t, o.Medium)
        }, function (t) {
          c(t, o.Low)
        }],
        a = [-1, -1, -1, -1],
        l = [];
      for (var h in o) l[o[h]] = [];

      function c(t, e) {
        for (;
          (t.timeRemaining() > 0 || t.didTimeout) && l[e].length;) {
          var i = l[e].shift();
          "function" == typeof i ? i() : i && "object" == typeof i && "function" == typeof i.performScheduledTask && i.performScheduledTask()
        }
        l[e].length ? a[e] = n.request(r[e], s[e]) : (n.cancel(a[e]), a[e] = -1)
      }
      t.exports = {
        schedule: function (t, e) {
          l[e].push(t), -1 === a[e] && (a[e] = n.request(r[e], s[e]))
        }
      }
    },
    2235: t => {
      t.exports = {
        Highest: 0,
        High: 1,
        Medium: 2,
        Low: 3
      }
    },
    546: t => {
      function e() {
        this._startTime = Date.now()
      }
      e.prototype = {
        _budget: 10,
        didTimeout: !1,
        timeRemaining: function () {
          return Math.max(0, this._budget - (Date.now() - this._startTime))
        }
      }, t.exports.request = function (t, i) {
        return "undefined" != typeof window && window.requestIdleCallback ? window.requestIdleCallback(t, i) : function (t) {
          return setTimeout((function () {
            var i = new e;
            t(i)
          }))
        }(t)
      }, t.exports.cancel = function (t, e) {
        return "undefined" != typeof window && window.cancelIdleCallback ? window.cancelIdleCallback(t, e) : clearTimeout(t)
      }
    },
    2936: (t, e, i) => {
      var n = i(311),
        o = i(210);

      function s(t) {
        for (var e, i = t.getBoundingClientRect(), s = t.offsetWidth, r = t.offsetHeight, a = [new o(0, 0), new o(s, 0), new o(s, r), new o(0, r)], l = new n, h = t.ownerDocument.defaultView; t.nodeType === Node.ELEMENT_NODE;) e = h.getComputedStyle(t), l = new n(e.transform).multiply(l), t = t.parentNode;
        var c = 1 / 0,
          d = 1 / 0;
        a.forEach((function (t) {
          var e = l.transformPoint(t);
          c = Math.min(c, e.x), d = Math.min(d, e.y)
        }));
        var u = window.pageXOffset + i.left - c,
          p = window.pageYOffset + i.top - d;
        return (new n).translate(u, p).multiply(l)
      }
      t.exports = {
        fromPageToElement: function (t, e) {
          return s(t).inverse().transformPoint(e)
        },
        fromElementToPage: function (t, e) {
          return s(t).transformPoint(e)
        }
      }
    },
    1435: (t, e, i) => {
      var n = i(3032),
        o = i(2114),
        s = i(5714),
        r = i(8877).XHRLoader,
        a = i(8877).Priority,
        l = i(5343),
        h = i(4937),
        c = i(2589),
        d = "DEVICE_IDENTIFIER",
        u = "BROWSER_INFO",
        p = "APPLICATION_IDENTIFIER",
        m = "USER_SESSION",
        g = {
          UserActionEvents: ["SCREEN_SIZE", d, u, p, "BROWSER_WINDOW_SIZE", "URL", "MAP_VIEW", m, "TILES"],
          NetworkEvents: [d, u, p, m]
        },
        _ = "USER_ACTION",
        f = "NETWORK",
        y = {
          Zoom: {
            name: "ZOOM",
            states: g.UserActionEvents,
            type: _
          },
          MapsLoad: {
            name: "MAPS_LOAD",
            states: g.UserActionEvents,
            type: _
          },
          AnnotationClick: {
            name: "ANNOTATION_CLICK",
            states: g.UserActionEvents,
            type: _
          },
          MapTypeChange: {
            name: "MAP_TYPE_CHANGE",
            states: g.UserActionEvents,
            type: _
          },
          MapNodeReady: {
            name: "MAP_NODE_READY",
            states: g.UserActionEvents,
            type: _
          },
          Search: {
            name: "SEARCH",
            states: g.NetworkEvents,
            type: f
          },
          SearchAC: {
            name: "SEARCH_AC",
            states: g.NetworkEvents,
            type: f
          },
          ForwardGeocoder: {
            name: "FORWARD_GEOCODER",
            states: g.NetworkEvents,
            type: f
          },
          ReverseGeocoder: {
            name: "REVERSE_GEOCODER",
            states: g.NetworkEvents,
            type: f
          },
          Directions: {
            name: "DIRECTIONS",
            states: g.NetworkEvents,
            type: f
          },
          PointsOfInterestSearch: {
            name: "POINTS_OF_INTEREST_SEARCH",
            states: g.NetworkEvents,
            type: f
          }
        };

      function v() {
        this._doNotTrack = o.doNotTrack(), o.isNode() || (this._isInternalClient = /\.apple\.com$/.test(window.origin) || /\.icloud\.com$/.test(window.origin) || /\.filemaker\.com$/.test(window.origin) || /\.apple-mapkit\.com$/.test(window.origin) || /\.tryrating\.com$/.test(window.origin), this._isAppHostingSite = /\.appspot.com$/.test(window.origin) || /\.herokuapp.com$/.test(window.origin), n.addEventListener(n.Events.Changed, this), n.ready && this._configurationBecameAvailable(), this.uaParserInfo = l.parseUserAgent(navigator.userAgent), this._debouncedQueueAsBackgroundTask = c(this._queueAsBackgroundTask, 1e4, this), window.addEventListener("pagehide", this))
      }
      v.prototype = {
        _queuedMessages: [],
        _loader: null,
        _analyticsUrl: null,
        _errorUrl: null,
        _sessionId: null,
        _sessionTimerStart: null,
        _sessionTimeToExpire: null,
        _sequenceNumber: null,
        _doNotTrack: null,
        Events: y,
        EventTarget: "UI_TARGET_UNKNOWN",
        log: function (t, e) {
          this._doNotTrack || o.isNode() || ((!this._sessionId || (new Date).getTime() > this._sessionTimeToExpire) && this._initSession(), (e = e || {}).uaParserInfo = this.uaParserInfo, this._queuedMessages.push(this._createMessage(t, e)), this._sequenceNumber++, n.analytics && this._debouncedQueueAsBackgroundTask())
        },
        getDataToSend: function (t) {
          return 0 === this._queuedMessages.length ? (this._loader.unschedule(), !1) : (t.setRequestHeader("Content-Type", "text/plain"), t.responseType = "text", this._createJSON())
        },
        loaderDidSucceed: function (t) {
          delete this._loader
        },
        loaderDidFail: function (t) {
          this._queuedMessages = this._queuedMessages.concat(JSON.parse(t.xhrData).analytics_event), delete this._loader
        },
        handleEvent: function (t) {
          switch (t.type) {
            case n.Events.Changed:
              this._configurationBecameAvailable();
              break;
            case "pagehide":
              this._sendPendingData()
          }
        },
        reduceHost: function (t) {
          var e = t.match(/([^.]+\.[^.]+)$/);
          return e && e.length > 0 ? e[0] : t
        },
        _createMessage: function (t, e) {
          var i;
          switch (t.type) {
            case _:
              i = this._createUserActionMessage(t, e);
              break;
            case f:
              i = this._createNetworkMessage(t, e);
              break;
            default:
              i = {}
          }
          if (e.states) {
            var n = g.UserActionEvents.concat(Object.keys(e.states));
            i.analytics_state = this._createStateMessages(n, e)
          } else i.analytics_state = this._createStateMessages(t.states, e);
          return i
        },
        _createUserActionMessage: function (t, e) {
          var i = {
            event_type: _,
            user_action_event: {
              user_action_event_key: t.name
            }
          };
          return (e.eventValue || 0 === e.eventValue) && (i.user_action_event.user_action_event_value = e.eventValue), e.eventTarget && (i.user_action_event.user_action_event_target = e.eventTarget), e.eventModule && (i.user_action_event.user_action_event_module = e.eventModule), i
        },
        _createNetworkMessage: function (t, e) {
          var i = {
            event_type: f,
            network_event: {
              network_service: t.name
            }
          },
            n = parseInt(e.responseCode);
          return e.responseCode && !isNaN(n) && (i.network_event.http_response_code = n), i
        },
        _initSession: function () {
          this._sessionId = {
            high: o.generateSessionIdValue(),
            low: o.generateSessionIdValue()
          }, this._sessionTimerStart = (new Date).getTime(), this._sessionTimeToExpire = this._sessionTimerStart + 9e5, this._sequenceNumber = 0
        },
        _createStateMessages: function (t, e) {
          return t.map((function (t) {
            var i = {
              state_type: t
            };
            return s[t] ? i[t.toLowerCase()] = s[t](this, e) : i[t.toLowerCase()] = e.states[t](e), i
          }), this)
        },
        _createJSON: function () {
          var t = JSON.stringify({
            analytics_message_type: "SHORT_SESSION_USAGE",
            analytics_event: this._queuedMessages
          });
          return this._queuedMessages = [], t
        },
        _configurationBecameAvailable: function () {
          n.analytics && (this._analyticsUrl = n.analytics.analyticsUrl, this._withCredentials = n.withCredentials), n.teamId && (this._teamId = n.teamId)
        },
        _scheduleLoader: function () {
          this._loader || (this._loader = new r(this._analyticsUrl, this, {
            method: "POST",
            priority: a.Low,
            retry: !0,
            withCredentials: this._withCredentials
          }), this._loader.schedule())
        },
        _queueAsBackgroundTask: function () {
          h.scheduleInBackground(this._scheduleLoader.bind(this), h.Priority.Low)
        },
        _sendPendingData: function () {
          if (0 !== this._queuedMessages.length)
            if ("function" == typeof navigator.sendBeacon) navigator.sendBeacon(this._analyticsUrl, this._createJSON());
            else {
              var t = new XMLHttpRequest;
              t.open("POST", this._analyticsUrl, !1), t.send(this._createJSON())
            }
        }
      }, t.exports = new v
    },
    1053: (t, e, i) => {
      var n = i(4891);
      t.exports = function (t) {
        var e = {
          host: location.host,
          mkjs_version: n.version
        };
        return t._isInternalClient && window.placecard && window.placecard.version && (e.placecard_version = window.placecard.version), t._teamId && (e.team_id = t._teamId), t._isInternalClient || t._isAppHostingSite || (e.host = t.reduceHost(location.host)), e
      }
    },
    5080: t => {
      t.exports = function (t, e) {
        var i = {
          browser_language: navigator.language,
          prefers_color_scheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "DARK" : "LIGHT"
        };
        return location.host.match(/duckduckgo.com$/) || location.host.match(/apple-mapkit.com$/) || (i.browser_name = e.uaParserInfo.browserInfo.name, i.browser_version = e.uaParserInfo.browserInfo.version), i.browser_origin = location.protocol + "//" + location.host, t._isInternalClient ? i.browser_referer = document.referrer : t._isAppHostingSite || (i.browser_origin = t.reduceHost(location.host)), i
      }
    },
    451: t => {
      t.exports = function (t) {
        if (t._isInternalClient) return {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    },
    7162: t => {
      t.exports = function (t, e) {
        return {
          device_platform: e.uaParserInfo.deviceInfo.platform,
          device_os_version: e.uaParserInfo.deviceInfo.os
        }
      }
    },
    5714: (t, e, i) => {
      t.exports = {
        SCREEN_SIZE: i(2232),
        DEVICE_IDENTIFIER: i(7162),
        BROWSER_INFO: i(5080),
        APPLICATION_IDENTIFIER: i(1053),
        BROWSER_WINDOW_SIZE: i(451),
        URL: i(3022),
        MAP_VIEW: i(2840),
        USER_SESSION: i(7985),
        TILES: i(8822)
      }
    },
    2840: t => {
      t.exports = function (t, e) {
        var i = e.map.region.toBoundingRegion(),
          n = e.map.ensureRenderingFrame().size;
        return {
          display_map_region: {
            eastLng: i.eastLongitude,
            northLat: i.northLatitude,
            southLat: i.southLatitude,
            westLng: i.westLongitude
          },
          zoom_level: e.map.zoomLevel,
          map_type: "MAP_TYPE_" + e.map.mapType.toUpperCase(),
          size: {
            width: n.width,
            height: n.height
          },
          color_scheme: e.map.colorScheme.toUpperCase()
        }
      }
    },
    2232: t => {
      t.exports = function (t) {
        var e = {
          device_pixel_ratio: window.devicePixelRatio
        };
        return t._isInternalClient ? (e.width = screen.width, e.height = screen.height, e) : e
      }
    },
    8822: t => {
      t.exports = function (t, e) {
        return {
          rendering: e.map._mapNodeController && e.map._mapNodeController.renderingMode
        }
      }
    },
    3022: t => {
      t.exports = function (t) {
        var e = {};
        return t._isInternalClient && (e.query_string = location.search, e.path = location.pathname), e
      }
    },
    7985: t => {
      t.exports = function (t) {
        var e = ((new Date).getTime() - t._sessionTimerStart) / 1e3;
        return {
          session_id: t._sessionId,
          sequence_number: t._sequenceNumber,
          relative_timestamp: e
        }
      }
    },
    5343: t => {
      function e(t) {
        var e, i;
        t = t.toLowerCase();
        try {
          return !t.includes("safari") || t.includes("chrome") || t.includes("crios") || t.includes("gsa") || t.includes("fxios") ? !t.includes("chrome") && !t.includes("crios") || t.includes("chromium") || t.includes("edge") || t.includes("samsungbrowser") ? !t.includes("firefox") && !t.includes("fxios") || t.includes("seamonkey") ? t.includes("msie") || t.includes("trident") && t.includes("rv") ? (e = "Internet Explorer", i = t.includes("msie") ? /msie\s(\d*\.?\d*)/gi.exec(t)[1] : /rv:(\d*\.?\d*)/gi.exec(t)[1]) : t.includes("edge") ? (e = "Edge", i = /edge\/(\d*\.?\d*)/gi.exec(t)[1]) : t.includes("gsa") ? (e = "Google Search App", i = /gsa\/(.*?)\s[^._\d]/i.exec(t)[1]) : (e = "other", i = "other") : (e = "Firefox", i = t.includes("firefox") ? /firefox\/(\d*\.?\d*)/gi.exec(t)[1] : /fxios\/(\d*\.?\d*)/gi.exec(t)[1]) : (e = "Chrome", i = t.includes("chrome") ? /chrome\/(.*?)\s/gi.exec(t)[1] : /crios\/(.*?)\s/gi.exec(t)[1]) : (e = "Safari", i = /version\/(\d+\.?\d*)/gi.exec(t)[1]), {
            name: e,
            version: i
          }
        } catch (t) {
          return {
            name: "other",
            version: "other"
          }
        }
      }

      function i(t) {
        var e, i;
        t = t.toLowerCase();
        try {
          return t.includes("ipad") ? (e = "iPad", i = "iOS " + /os\s+(.*?)[^_.\d]/i.exec(t)[1]) : t.includes("iphone") && !t.includes("ipad") ? (e = "iPhone", i = "iOS " + /os\s+(.*?)[^_.\d]+/i.exec(t)[1]) : t.includes("macintosh") ? (e = "Macintosh", i = "Mac OS X " + /mac os x (.*?)[^_.\d]/.exec(t)[1]) : t.includes("windows") ? (e = "Windows", i = "Windows NT " + /windows nt (.*?)[^._\d]/.exec(t)[1]) : t.includes("android") ? (e = "Android", i = "Android " + /android (.*?)[^._\d]/.exec(t)[1]) : t.includes("linux") && !t.includes("android") ? (e = "Linux", i = "Linux") : t.includes("cros") ? (e = "Chrome OS", i = "Chrome OS") : (e = "other", i = "other"), {
            platform: e,
            os: i
          }
        } catch (t) {
          return {
            platform: "other",
            os: "other"
          }
        }
      }
      t.exports = {
        parseUserAgent: function (t) {
          return {
            browserInfo: e(t),
            deviceInfo: i(t)
          }
        }
      }
    },
    1692: (t, e, i) => {
      var n = i(4937),
        o = [],
        s = Date.now(),
        r = null,
        a = function t() {
          var e = o.length;
          if (null === r && e > 0) {
            for (var i = 0; i < e; ++i) n.scheduleASAP(o[i]);
            n.scheduleOnNextFrame(t)
          }
        },
        l = function () {
          r = Date.now()
        },
        h = function () {
          null !== r && (s += Date.now() - r, r = null, n.scheduleASAP(a))
        };
      t.exports = {
        setIsAnimated: function (t, e) {
          var i = o.indexOf(t);
          if (e && i < 0 && (o.push(t), 1 === o.length)) {
            n.scheduleASAP(a);
            try {
              window.top.addEventListener("blur", l), window.top.addEventListener("focus", h)
            } catch (t) { }
          }
          if (!e && i > -1 && (o.splice(i, 1), 0 === o.length)) try {
            window.top.removeEventListener("blur", l), window.top.removeEventListener("focus", h)
          } catch (t) { }
        },
        getIsAnimated: function (t) {
          return o.indexOf(t) > -1
        },
        isRunning: function () {
          return null === r
        },
        getClock: function () {
          return Date.now() - s
        }
      }
    },
    815: t => {
      t.exports = ':host(.mk-annotation-container.mk-dragging) ::selection,div.mk-annotations ::selection{background:0 0}.mk-invisible{opacity:0;pointer-events:none}.mk-hidden{display:none}div.mk-annotations,div.mk-annotations>div,div.mk-callouts,div.mk-style-helper{position:absolute;top:0;left:0}.mk-selected{z-index:1}.mk-lifted{z-index:2}.mk-callout{position:absolute;top:0;left:0;pointer-events:auto;-webkit-user-select:auto;-moz-user-select:text;-ms-user-select:text}:host(.mk-dark-mode) .mk-callout{color:#fff}.mk-callout>*{position:absolute;top:0;left:0}svg.mk-bubble{display:block;width:100%;height:100%}div.mk-callout-accessory{position:absolute;top:50%;transform:translateY(-50%);overflow:hidden}div.mk-callout-accessory-content{white-space:nowrap;position:relative;text-align:center;font-size:12px}div.mk-callout-accessory:first-child{left:0}div.mk-callout-accessory:last-child{right:0}div.mk-callout-accessory:first-child .mk-callout-accessory-content{padding-right:8px}div.mk-callout-accessory:last-child .mk-callout-accessory-content{padding-left:8px}div.mk-standard{font-family:"-apple-system",BlinkMacSystemFont,"Helvetica Neue",Helvetica,Arial,sans-serif;box-sizing:border-box;position:relative}div.mk-custom-content,div.mk-standard{transform:translateY(-50%)}div.mk-standard .mk-callout-content>div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}div.mk-standard .mk-callout-content{padding:0 4px}.mk-callout-content.mk-rtl{direction:rtl}.mk-callout-content.mk-rtl *{text-align:right}div.mk-callout-accessory:first-child+.mk-callout-content{padding-left:8px}div.mk-standard .mk-callout-content:nth-last-child(2){padding-right:8px}div.mk-standard .mk-title{font-size:17px;font-weight:500;color:#000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.025em}:host(.mk-dark-mode) div.mk-standard .mk-title{color:#fff}div.mk-standard .mk-subtitle{font-size:13px;color:rgba(0,0,0,.7);letter-spacing:.025em}:host(.mk-dark-mode) div.mk-standard .mk-subtitle{color:rgba(255,255,255,.7)}svg.mk-bubble path{fill:#fff;stroke:rgba(0,0,0,.2)}:host(.mk-dark-mode) svg.mk-bubble path{fill:#3e3e3e;stroke:rgba(0,0,0,.5)}'
    },
    8928: (t, e, i) => {
      var n = i(7236).Point,
        o = i(4937);

      function s(t) {
        this._annotation = t
      }
      s.prototype = {
        liftDurationMs: 200,
        liftOpacity: .5,
        animateLift: function () {
          var t = Math.min((Date.now() - this._liftAnimationStartDate) / this.liftDurationMs, 1);
          this._annotation.translate(this.translation.x, this.translation.y - this.liftAmount * t), this._annotation.opacity = 1 - (1 - this.liftOpacity) * t, t < 1 ? (o.scheduleOnNextFrame(this), this._liftAnimationProgress = t) : (delete this._liftAnimationStartDate, delete this._liftAnimationProgress)
        },
        animateDropAfterLift: function () {
          var t = Math.max(this._dropAnimationStartP - Math.min((Date.now() - this._dropAfterLiftAnimationStartDate) / this.liftDurationMs, 1), 0);
          this._dropAnimationRevert && this._annotation.translate(0, -this.liftAmount * t), this._annotation.opacity = 1 - (1 - this.liftOpacity) * t, t > 0 ? o.scheduleOnNextFrame(this) : this._annotation.droppedAfterLift()
        },
        dropAnnotationAfterDraggingAndRevertPosition: function (t) {
          this._liftAnimationStartDate ? (this._dropAnimationStartP = this._liftAnimationProgress, delete this._liftAnimationStartDate, delete this._liftAnimationProgress) : this._dropAnimationStartP = 1, t ? this._annotation.resetNodeTransform() : this._annotation.draggingDidEnd(), this._dropAfterLiftAnimationStartDate = Date.now(), this._dropAnimationRevert = t, o.scheduleOnNextFrame(this)
        },
        lift: function (t) {
          this.liftAmount = t, this.translation = new n, t > 0 ? (this._liftAnimationStartDate = Date.now(), this._liftAnimationProgress = 0, o.scheduleOnNextFrame(this)) : this._annotation.opacity = this.liftOpacity
        },
        getTranslation: function () {
          return new n(this.translation.x, this.translation.y - this.liftAmount)
        },
        setTranslation: function (t) {
          this.translation = t, this._liftAnimationStartDate || this._annotation.translate(this.translation.x + this._annotation.dragOffset.x, this.translation.y - this.liftAmount + this._annotation.dragOffset.y)
        },
        performScheduledUpdate: function () {
          this._liftAnimationStartDate ? this.animateLift() : this._dropAfterLiftAnimationStartDate && this.animateDropAfterLift()
        }
      }, t.exports = s
    },
    9299: (t, e, i) => {
      var n = i(210),
        o = i(4937);

      function s(t) {
        this._map = t, this.panning = !1
      }
      s.prototype = {
        constructor: s,
        update: function (t, e) {
          if (this._map.isScrollEnabled) {
            var i = t._impl.translatedPosition(),
              s = i.x,
              r = s + e.size.width,
              a = i.y,
              l = a + e.size.height,
              h = this._map.ensureVisibleFrame();
            this._direction = new n, s <= h.minX() ? this._direction.x = 1 : r >= h.maxX() && (this._direction.x = -1), a <= h.minY() + 5 ? this._direction.y = 1 : l >= h.maxY() - 5 && (this._direction.y = -1);
            var c = 0 !== this._direction.x || 0 !== this._direction.y;
            !this.panning && c ? (this.panning = !0, this._startTime = Date.now(), this._initialSpeed = Math.floor(1 / 104.1 * (h.size.width + h.size.height) / 2), o.scheduleOnNextFrame(this)) : this.panning && !c && this.stop()
          }
        },
        stop: function () {
          this.panning && (this.panning = !1, delete this._direction, delete this._startTime, delete this._initialSpeed)
        },
        performScheduledUpdate: function () {
          if (this.panning) {
            0;
            var t = this._initialSpeed,
              e = Date.now() - this._startTime;
            e > 4e3 ? t *= 3 : e > 1e3 && (t *= 1.5), this._map.translateCameraAnimated(new n(this._direction.x * t, this._direction.y * t), !1), this._map.panningDuringAnnotationDrag(), o.scheduleOnNextFrame(this)
          }
        },
        mapWasDestroyed: function () {
          delete this._map
        }
      }, t.exports = s
    },
    747: (t, e, i) => {
      var n = i(9601),
        o = n.Coordinate,
        s = i(4140),
        r = i(311),
        a = i(9477),
        l = i(210),
        h = i(2114),
        c = i(9328),
        d = i(1232),
        u = i(7094),
        p = i(2466),
        m = ["title", "subtitle", "data", "accessibilityLabel", "anchorOffset", "calloutOffset", "size", "callout", "visible", "enabled", "selected", "calloutEnabled", "animates", "appearanceAnimation", "collisionMode", "padding"],
        g = ["draggable", "displayPriority", "clusteringIdentifier"],
        _ = {
          DragStart: "drag-start",
          Dragging: "dragging",
          DragEnd: "drag-end"
        },
        f = {
          Low: 250,
          High: 750,
          Required: 1e3
        },
        y = {
          Rectangle: "rectangle",
          Circle: "circle",
          None: "none"
        };

      function v(t) {
        function e(e, i, n, o) {
          t.call(this, e), h.checkOptions(o), this._setCoordinate(i), this._unsized = !0, this._public = e, this.occluded = !1, this._setNode(i, n, o), o && (m.forEach((function (t) {
            t in o && (this[t] = o[t])
          }), this), g.forEach((function (t) {
            t in o && this["_set" + t.replace(/^\w/, (function (t) {
              return t.toUpperCase()
            }))](o[t])
          }), this), Object.keys(o).forEach((function (t) {
            "map" === t || "element" === t ? console.warn("[MapKit] `" + t + "` is read-only and can't be set on an Annotation.") : this.isAKnownOption(t) || console.warn("[MapKit] Unknown option for annotation: " + t + " (use the `data` property instead)")
          }), this)), d.addEventListener(d.Events.LocaleChanged, this), this.updateLocalizedText()
        }
        return e.Events = _, e.DisplayPriority = f, e.CollisionMode = y, e.prototype = h.inheritPrototype(t, e, {
          _calloutOffset: new window.DOMPoint(0, 1),
          _enabled: !0,
          _selected: !1,
          _calloutEnabled: !0,
          _draggable: !1,
          _title: "",
          _subtitle: "",
          _accessibilityLabel: null,
          _displayPriority: f.Required,
          _collisionMode: y.Rectangle,
          _clusteringIdentifier: null,
          _sceneGraphNode: null,
          _padding: new u,
          _draggingLift: 40,
          shouldHideLabels: !1,
          alwaysSelected: !1,
          _callout: null,
          get map() {
            return this.delegate && this.delegate.mapForAnnotation(this._public)
          },
          set map(t) {
            console.warn("[MapKit] The `map` property is read-only.")
          },
          get coordinate() {
            return this._coordinate
          },
          set coordinate(t) {
            this.memberAnnotations || this._setCoordinate(t)
          },
          get title() {
            return this._title
          },
          set title(t) {
            null != t ? (h.checkType(t, "string", "[MapKit] Expected a string value for Annotation.title, but got `" + t + "` instead"), this._title = t) : delete this._title, this.updateLocalizedText(), this._updatedProperty("title")
          },
          get subtitle() {
            return this._subtitle
          },
          set subtitle(t) {
            null != t ? (h.checkType(t, "string", "[MapKit] Expected a string value for Annotation.subtitle, but got `" + t + "` instead"), this._subtitle = t) : delete this._subtitle, this.updateLocalizedText(), this._updatedProperty("subtitle")
          },
          get accessibilityLabel() {
            return this._accessibilityLabel
          },
          set accessibilityLabel(t) {
            null != t ? (h.checkType(t, "string", "[MapKit] Expected a string value for Annotation.accessibilityLabel, but got `" + t + "` instead"), this._accessibilityLabel = t) : delete this._accessibilityLabel, this.updateLocalizedText()
          },
          get data() {
            return Object.prototype.hasOwnProperty.call(this, "_data") || (this._data = {}), this._data
          },
          set data(t) {
            this._data = t
          },
          get enabled() {
            return this._enabled
          },
          set enabled(t) {
            this._enabled = !!t
          },
          get calloutEnabled() {
            return this._calloutEnabled
          },
          set calloutEnabled(t) {
            this._calloutEnabled = !!t
          },
          get selected() {
            return this._selected
          },
          set selected(t) {
            var e = !!t;
            if (e !== this._selected) {
              if (this.delegate && !this.delegate.selectionMayChange) return void console.warn("[MapKit] Selection may not change in select/deselect event handler.");
              this._selected = e, this._updatedProperty("selected")
            }
          },
          get animates() {
            return this._animates
          },
          set animates(t) {
            this._animates = !!t
          },
          get calloutOffset() {
            return this._calloutOffset
          },
          set calloutOffset(t) {
            h.checkInstance(t, window.DOMPoint, "[MapKit] Annotation.calloutOffset expected a DOMPoint, but got `" + t + "` instead."), this._calloutOffset = new window.DOMPoint(t.x, t.y), this._updatedProperty("calloutOffset")
          },
          get callout() {
            return this._callout
          },
          set callout(t) {
            h.checkType(t, "object", "[MapKit] Annotation.callout expected an object, but got `" + t + "` instead."), this._callout = t
          },
          get draggable() {
            return this._draggable
          },
          set draggable(t) {
            this.memberAnnotations || this._setDraggable(t)
          },
          get draggingLift() {
            return this._draggingLift
          },
          set draggingLift(t) {
            if (h.checkType(t, "number", "[MapKit] Annotation.draggingLift expected a number, but got `" + t + "` instead."), t < 0) throw new Error("[MapKit] Annotation.draggingLift must be zero or more.");
            this._draggingLift = t
          },
          get size() {
            if (this._updateSize(), !this._unsized) return this._node.size.copy()
          },
          set size(t) {
            var e = "[MapKit] Annotation size expects a size object with width and height properties";
            h.checkType(t, "object", e).checkType(t.width, "number", e).checkType(t.height, "number", e), this.setSize(new s(t.width, t.height)), this._userSetSize = !0, this.updateSize()
          },
          get opacity() {
            return this.sceneGraphNode ? this.sceneGraphNode.opacity : this.node.opacity
          },
          set opacity(t) {
            this.sceneGraphNode ? this.sceneGraphNode.opacity = t : this.node.opacity = t
          },
          get displayPriority() {
            return this._displayPriority
          },
          set displayPriority(t) {
            this.memberAnnotations || this._setDisplayPriority(t)
          },
          isRequired: function () {
            return this.selected || this.displayPriority === f.Required
          },
          get collisionMode() {
            return this._collisionMode
          },
          set collisionMode(t) {
            if (!h.checkValueIsInEnum(t, y)) throw new Error("[MapKit] Unknown value for `collisionMode`. Choose from Annotation.CollisionMode.");
            t !== this._collisionMode && (this._collisionMode = t, this._updatedProperty("collisionMode"))
          },
          get clusteringIdentifier() {
            return this._clusteringIdentifier
          },
          set clusteringIdentifier(t) {
            this.memberAnnotations || this._setClusteringIdentifier(t)
          },
          get padding() {
            return this._padding.copy()
          },
          set padding(t) {
            h.checkInstance(t, u, "[MapKit] The `padding` parameter passed to `Annotation.padding` is not a Padding."), this._padding.equals(t) || (this._padding = t.copy(), this._updatedProperty("padding"))
          },
          get needsLayout() {
            return this._sceneGraphNode && this._sceneGraphNode.needsLayout
          },
          get elementInAnnotationDOM() {
            return this._node.element.firstChild
          },
          removedFromMap: function () {
            this._removedFromMap = !0, d.removeEventListener(d.Events.LocaleChanged, this), this._occludedAnimation && this._occludedAnimation.end(), this._clusteringAnimation && this._clusteringAnimation.end()
          },
          addedToMap: function () {
            this._removedFromMap && (this._removedFromMap = !1, d.addEventListener(d.Events.LocaleChanged, this), this.updateLocalizedText())
          },
          delegate: null,
          setDelegate: function (t) {
            this.delegate = t
          },
          updateLayout: function () { },
          doesAnimate: function () {
            return this._animates && !!this._appearanceAnimationName
          },
          willMoveToMap: function () {
            this._isMoving = this.doesAnimate(), this._updateSize()
          },
          didMoveToMap: function () {
            this._isMoving && this._appearanceAnimationName && this._visible && (this.element.style.animation = this.element.style.webkitAnimation = this._appearanceAnimation, (this.element.style.animationName || this.element.style.webkitAnimationName) && (this._animating = !0, this.element.addEventListener("animationend", this), this.element.addEventListener("webkitAnimationEnd", this))), delete this._isMoving
          },
          isStable: function () {
            return !(this.isWaiting || this._isMoving || this._isAnimating || this._isLifted)
          },
          canShowCallout: function () {
            return this._calloutEnabled && this.isStable()
          },
          calloutWillAppear: function () { },
          calloutWillDisappear: function () { },
          canBePicked: function () {
            return this._shown && this._visible && !this._isMoving && !this._isAnimating && !this._isLifted && !this.occluded
          },
          draggingDidStart: function () {
            this._public.dispatchEvent(new p.Event(_.DragStart))
          },
          isDraggable: function () {
            return this.draggable && !this._isLifted
          },
          isLifted: function () {
            return this._isLifted
          },
          dispatchDraggingEvent: function () {
            var t = new p.Event(e.Events.Dragging);
            return t.coordinate = this._coordinateDuringDrag(), this._public.dispatchEvent(t), t
          },
          positionForCallout: function () {
            var t = this._calloutAnchorPoint;
            if (!t) {
              var e = this._userSetSize ? this._node.size : this.delegate.sizeForElement(this.elementInAnnotationDOM);
              t = new window.DOMPoint(-e.width / 2, 0)
            }
            var i = this.nodePosition();
            return new l(i.x - t.x - this._calloutOffset.x, i.y - t.y - this._calloutOffset.y)
          },
          setDraggingTranslationForMapFrameSize: function (t, e) {
            this._dragController.setTranslation(this.clampDraggingTranslationForMapFrameSize(t, e))
          },
          dropAfterDraggingAndRevertPosition: function (t) {
            this._dragController.dropAnnotationAfterDraggingAndRevertPosition(t)
          },
          distanceToPoint: function (t) {
            var e = this._node.position.x,
              i = e + this._node.size.width,
              n = e - t.x,
              o = i - t.x,
              s = n <= 0 && o >= 0 ? 0 : Math.min(Math.abs(n), Math.abs(o)),
              r = this._node.position.y,
              a = r + this._node.size.height,
              l = r - t.y,
              h = a - t.y,
              c = l <= 0 && h >= 0 ? 0 : Math.min(Math.abs(l), Math.abs(h));
            return s * s + c * c
          },
          lift: function () {
            this._isLifted = !0, this._dragController.lift(this._draggingLift), this._updatedProperty("")
          },
          translate: function (t, e) {
            this.sceneGraphNode ? this.sceneGraphNode.transform = (new r).translate(t, e) : this._node.transform = (new a).translate(t, e)
          },
          translatedPosition: function () {
            var t = this._dragController.getTranslation();
            return new l(this._position.x - this._anchorPoint.x - this._anchorOffset.x + t.x, this._position.y - this._anchorPoint.y - this._anchorOffset.y + t.y)
          },
          updatedPosition: function () {
            return this.coordinate ? (this.x = n.convertLongitudeToX(n.wrapLongitude(this.coordinate.longitude)), this.y = n.convertLatitudeToY(this.coordinate.latitude), !0) : (this.setShown(!1), this.sceneGraphNode && this.sceneGraphNode.remove(), !1)
          },
          get sceneGraphNode() {
            return this._sceneGraphNode
          },
          mayBeDrawn: function () {
            return !!this.sceneGraphNode && this._shown && this.visible && !this.isWaiting
          },
          isDrawn: function () {
            return (!this.occluded || this._occludedAnimation) && this.mayBeDrawn()
          },
          animateOcclusion: function () {
            var t = this.occluded ? 0 : 1;
            this._sceneGraphNode && (this._occludedAnimation && this._occludedAnimation.end(), this._occludedAnimation = new c.NodeAnimator.Opacity({
              node: this._sceneGraphNode,
              from: 1 - t,
              to: t,
              duration: 200,
              done: function () {
                delete this._occludedAnimation
              }.bind(this)
            }).begin());
            var e = this.occluded && this.cluster && this.cluster._impl && !this.cluster._impl.occluded,
              i = !this.occluded && this.previousCluster && !this.previousCluster._impl.wasOccluded;
            (e || i) && this._animateClustering()
          },
          positionWasUpdated: function (t) {
            this._sceneGraphNode && (this._sceneGraphNode.needsDisplay = !0)
          },
          dragOffset: l.Zero,
          handleEvent: function (t) {
            switch (t.type) {
              case d.Events.LocaleChanged:
                this.updateLocalizedText();
                break;
              case "animationend":
              case "webkitAnimationEnd":
                if (t.animationName !== this._appearanceAnimationName) return;
                this.element.style.animation = this.element.style.webkitAnimation = "", this.element.removeEventListener("animationend", this), this.element.removeEventListener("webkitAnimationEnd", this), this.finishedAnimating()
            }
          },
          updateLocalizedText: function () {
            this._node && this._node.element && this._node.element.setAttribute("aria-label", this.altText())
          },
          altText: function () {
            return this._accessibilityLabel || (this.title && this.subtitle ? d.get("Annotation.Generic.AccessibilityLabel", {
              title: this.title,
              subtitle: this.subtitle
            }) : this.title || this.subtitle || "")
          },
          updateSize: function () {
            delete this._unsized, this._selected && this.delegate && this.delegate.selectedAnnotationDidMoveToMap(this._public)
          },
          clampDraggingTranslationForMapFrameSize: function (t, e) {
            var i = this._anchorPoint.x + this._anchorOffset.x - this._position.x,
              n = e.width - this._node.size.width + i,
              o = this._anchorPoint.y + this._anchorOffset.y + this._dragController.liftAmount - this._position.y,
              s = e.height - this._node.size.height + o;
            return new l(h.clamp(t.x, i, n), h.clamp(t.y, o, s))
          },
          droppedAfterLift: function () {
            delete this._isLifted, this.selected && this.delegate.selectedAnnotationDidMoveToMap(this._public), this._updatedProperty("")
          },
          draggingDidEnd: function () {
            this.coordinate = this._coordinateDuringDrag(), this.resetNodeTransform(), this._public.dispatchEvent(new p.Event(e.Events.DragEnd))
          },
          resetNodeTransform: function () {
            this.node.transform = new a
          },
          finishedAnimating: function () {
            delete this._isAnimating, this._selected && this.delegate && this.delegate.selectedAnnotationDidMoveToMap(this._public), this._visible || this._updateVisibility(), this.delegate && this.delegate.annotationFinishedAnimating(this._public)
          },
          isAKnownOption: function (t) {
            return m.indexOf(t) >= 0 || g.indexOf(t) >= 0
          },
          _animateClustering: function () {
            if (this._sceneGraphNode) {
              var t = {
                annotation: this,
                node: this._sceneGraphNode,
                duration: 200,
                done: function () {
                  delete this._clusteringAnimation
                }.bind(this)
              };
              this.cluster ? (t.from = this.coordinate.toMapPoint(), t.to = this.cluster.coordinate.toMapPoint()) : (t.from = this.previousCluster.coordinate.toMapPoint(), t.to = this.coordinate.toMapPoint());
              var e = t.to.x - t.from.x;
              e < -.5 ? t.to.x += 1 : e > .5 && (t.from.x += 1), this._clusteringAnimation && this._clusteringAnimation.end(), this._clusteringAnimation = new w(t).begin()
            }
          },
          _setCoordinate: function (t) {
            h.checkInstance(t, o, "[MapKit] Annotation.coordinate expected a Coordinate value."), delete this._translation, this._coordinate = t.copy(), this._updatedProperty("coordinate")
          },
          _setDraggable: function (t) {
            var e = !!t;
            e !== this._draggable && (this._draggable = e, this._updatedProperty("draggable"))
          },
          _setDisplayPriority: function (t) {
            var e = "[MapKit] Annotation displayPriority expects a number between 0 and " + f.Required;
            h.checkType(t, "number", e);
            var i = h.clamp(t, 0, f.Required);
            if (i !== t) console.warn(e + ", value was normalized");
            else if (i === this._displayPriority) return;
            this._displayPriority = i, this._updatedProperty("displayPriority")
          },
          _setClusteringIdentifier: function (t) {
            null !== t && h.checkType(t, "string", "[MapKit] Annotation clusteringIdentifier expects a string"), this._clusteringIdentifier !== t && (this._clusteringIdentifier = t, this._updatedProperty("clusteringIdentifier"))
          },
          _coordinateDuringDrag: function () {
            var t = this.sceneGraphNode ? this._dragController.translation.x : 0,
              e = this.sceneGraphNode ? this._dragController.translation.y - this._dragController.liftAmount : 0,
              i = this.node.convertPointToPage(new l(t + this.dragOffset.x + this._anchorPoint.x + this.anchorOffset.x, e + this.dragOffset.y + this._anchorPoint.y + this.anchorOffset.y));
            return this.delegate._map.convertPointOnPageToCoordinate(new window.DOMPoint(i.x, i.y))
          },
          _updateSize: function () {
            if (this._unsized && !this._userSetSize && this.delegate) {
              var t = this.delegate.sizeForElement(this.elementInAnnotationDOM);
              t && (delete this._unsized, this.setSize(t))
            }
          },
          _updatedProperty: function (t) {
            this.delegate && this.delegate.annotationPropertyDidChange(this._public, t)
          }
        }), e
      }

      function w(t) {
        c.NodeAnimator.Basic.call(this, t), this.annotation = t.annotation
      }
      w.prototype = h.inheritPrototype(c.NodeAnimator.Basic, w, {
        update: function (t) {
          var e = this.annotation,
            i = e.delegate._map,
            o = i.camera.toRenderingMapRect(),
            s = n.wrapX((1 - t) * this.from.x + t * this.to.x, o.midX()),
            a = (1 - t) * this.from.y + t * this.to.y,
            h = i.adjustMapItemPoint(i.camera.transformMapPoint(new l(s, a)));
          this.node.transform = (new r).translate(h.x - e._position.x, h.y - e._position.y)
        },
        stringInfo: function () {
          return c.NodeAnimator.Basic.prototype.stringInfo.call(this, "translation*")
        }
      }), v.Events = _, v.DisplayPriority = f, v.CollisionMode = y, t.exports = v
    },
    5077: (t, e, i) => {
      var n = i(8928),
        o = i(6922),
        s = i(6246),
        r = i(747),
        a = i(2114),
        l = i(3658),
        h = i(270),
        c = r(o);
      c.prototype._animates = !0, c.prototype._setNode = function (t, e, i) {
        a.checkType(e, "function");
        var o = s(e, window, [t, i]);
        a.checkElement(o, "[MapKit] Annotation element factory must return a DOM element, got `" + o + "` instead."), this._element = o;
        var r = o;
        if (l.supportsShadowDOM) {
          var c = "mk-slot-" + Math.random().toString(32).substr(2, 8);
          o.slot = c, (r = l.htmlElement("slot")).name = c
        }
        this._node = new h.Node(l.htmlElement("div", r)), this._node.wantsHardwareCompositing = !0, this._dragController || (this._dragController = new n(this))
      }, c.div = function () {
        return document.createElement("div")
      }, t.exports = c
    },
    6922: (t, e, i) => {
      var n = i(2114),
        o = i(210),
        s = "mk-hidden",
        r = "mk-invisible";

      function a(t) {
        t && (this._public = t)
      }
      a.prototype = {
        _shown: !0,
        _visible: !0,
        _position: new o,
        _anchorPoint: new o,
        _anchorOffset: new window.DOMPoint,
        _appearanceAnimation: "",
        renderedByDOMElement: !0,
        isMapFeature: !1,
        delegate: null,
        get node() {
          return this._node
        },
        get element() {
          return this._element
        },
        set element(t) {
          console.warn("[MapKit] The `element` property is read-only.")
        },
        get anchorOffset() {
          return this._anchorOffset
        },
        set anchorOffset(t) {
          n.checkInstance(t, window.DOMPoint, "[MapKit] Annotation.anchorOffset expected a DOMPoint, but got `" + t + "` instead."), this._anchorOffset = new window.DOMPoint(t.x, t.y), this.updatePosition()
        },
        get visible() {
          return this._visible
        },
        set visible(t) {
          t = !!t, this._visible !== t && (this._visible = t, this._updateVisibility())
        },
        get appearanceAnimation() {
          return this._appearanceAnimation
        },
        set appearanceAnimation(t) {
          if (n.checkType(t, "string", "[MapKit] Annotation.appearanceAnimation expected a string, but got `" + t + "` instead."), "" !== t) {
            var e = document.createElement("div");
            e.style.animation = e.style.webkitAnimation = t, this._appearanceAnimationName = e.style.animationName || e.style.webkitAnimationName, this._appearanceAnimationName ? this._appearanceAnimation = t : console.warn("[MapKit] Annotation.appearanceAnimation expects an animation style value with an animation name, but got `" + t + "` instead.")
          } else this._appearanceAnimation = this._appearanceAnimationName = ""
        },
        nodePosition: function () {
          return this._nodePosition || this._node.position
        },
        calculateNodePosition: function () {
          return new o(this._position.x - this._anchorPoint.x - this._anchorOffset.x, this._position.y - this._anchorPoint.y - this._anchorOffset.y)
        },
        updatePosition: function () {
          var t = this.calculateNodePosition();
          !this.renderedByDOMElement && this.map && this.map._impl.cameraIsMoving ? this._nodePosition = t : (delete this._nodePosition, this._node.position = t), this.positionWasUpdated(t)
        },
        setShown: function (t) {
          t = !!t, this._shown !== t && (this._shown = t, this._node.element && this._node.classList.toggle(s, !t), this.shownPropertyWasUpdated(t))
        },
        shownPropertyWasUpdated: function () { },
        positionWasUpdated: function (t) { },
        isShown: function () {
          return this._shown
        },
        position: function () {
          return this._position
        },
        setPosition: function (t) {
          this._position = t, this.updatePosition()
        },
        updateVisibility: function (t) {
          this._node.classList.toggle(r, t)
        },
        setSize: function (t) {
          this._node.size = t, this._anchorPoint = new o(t.width / 2, t.height), this.updatePosition()
        },
        _updateVisibility: function () {
          !this._visible && this._animating || (this.updateVisibility(!this._visible), this.delegate && this.delegate.annotationPropertyDidChange(this._public || this, "visible"))
        }
      }, t.exports = a
    },
    8302: (t, e, i) => {
      var n = i(2114),
        o = i(2466),
        s = i(6922);

      function r() {
        Object.defineProperty(this, "_impl", {
          value: new s(this)
        })
      }
      r.prototype = n.inheritPrototype(o.EventTarget, r, {
        get element() {
          return this._impl.element
        },
        set element(t) {
          this._impl.element = t
        },
        get anchorOffset() {
          return this._impl.anchorOffset
        },
        set anchorOffset(t) {
          this._impl.anchorOffset = t
        },
        get animates() {
          return this._impl.animates
        },
        set animates(t) {
          this._impl.animates = t
        },
        get visible() {
          return this._impl.visible
        },
        set visible(t) {
          this._impl.visible = t
        },
        get appearanceAnimation() {
          return this._impl.appearanceAnimation
        },
        set appearanceAnimation(t) {
          this._impl.appearanceAnimation = t
        }
      }), t.exports = r
    },
    6074: (t, e, i) => {
      var n = i(8302),
        o = i(747),
        s = i(1636),
        r = i(2114);

      function a(t, e, n) {
        if (s(this, a)) {
          var o = i(5077);
          Object.defineProperty(this, "_impl", {
            value: new o(this, t, e, n)
          })
        }
      }
      a.EVENTS = o.EVENTS, a.DisplayPriority = o.DisplayPriority, a.CollisionMode = o.CollisionMode, a.prototype = r.inheritPrototype(n, a, {
        get map() {
          return this._impl.map
        },
        set map(t) {
          this._impl.map = t
        },
        get coordinate() {
          return this._impl.coordinate
        },
        set coordinate(t) {
          this._impl.coordinate = t
        },
        get title() {
          return this._impl.title
        },
        set title(t) {
          this._impl.title = t
        },
        get subtitle() {
          return this._impl.subtitle
        },
        set subtitle(t) {
          this._impl.subtitle = t
        },
        get accessibilityLabel() {
          return this._impl.accessibilityLabel
        },
        set accessibilityLabel(t) {
          this._impl.accessibilityLabel = t
        },
        get data() {
          return this._impl.data
        },
        set data(t) {
          this._impl.data = t
        },
        get enabled() {
          return this._impl.enabled
        },
        set enabled(t) {
          this._impl.enabled = t
        },
        get calloutEnabled() {
          return this._impl.calloutEnabled
        },
        set calloutEnabled(t) {
          this._impl.calloutEnabled = t
        },
        get selected() {
          return this._impl.selected
        },
        set selected(t) {
          this._impl.selected = t
        },
        get animates() {
          return this._impl.animates
        },
        set animates(t) {
          this._impl.animates = t
        },
        get calloutOffset() {
          return this._impl.calloutOffset
        },
        set calloutOffset(t) {
          this._impl.calloutOffset = t
        },
        get callout() {
          return this._impl.callout
        },
        set callout(t) {
          this._impl.callout = t
        },
        get draggable() {
          return this._impl.draggable
        },
        set draggable(t) {
          this._impl.draggable = t
        },
        get size() {
          return this._impl.size
        },
        set size(t) {
          this._impl.size = t
        },
        get displayPriority() {
          return this._impl.displayPriority
        },
        set displayPriority(t) {
          this._impl.displayPriority = t
        },
        get collisionMode() {
          return this._impl.collisionMode
        },
        set collisionMode(t) {
          this._impl.collisionMode = t
        },
        get clusteringIdentifier() {
          return this._impl.clusteringIdentifier
        },
        set clusteringIdentifier(t) {
          this._impl.clusteringIdentifier = t
        },
        get padding() {
          return this._impl.padding
        },
        set padding(t) {
          this._impl.padding = t
        }
      }), t.exports = a
    },
    1619: (t, e, i) => {
      var n = i(9328),
        o = i(2114);

      function s(t) {
        n.GroupNode.call(this), this._element = t
      }
      s.prototype = o.inheritPrototype(n.GroupNode, s, {
        get element() {
          return this._element
        },
        stringInfo: function () {
          return "AnnotationsControllerNode"
        }
      }), t.exports = s
    },
    1519: (t, e, i) => {
      var n = i(9601),
        o = i(9299),
        s = i(8522),
        r = i(3655),
        a = i(8790),
        l = i(1619),
        h = i(6074),
        c = i(747),
        d = i(6701),
        u = i(5266),
        p = n.MapRect,
        m = i(1364),
        g = i(3658),
        _ = i(4712),
        f = i(6246),
        y = i(7763),
        v = i(2114),
        w = i(210),
        b = i(1593);
      if (window.document) var C = i(9171),
        k = i(270);
      var S = i(4937),
        M = i(2589),
        E = "mk-annotation-container",
        L = "mk-annotations",
        T = "mk-callouts",
        x = "mk-dragging",
        A = "mk-selected",
        I = "mk-lifted",
        R = null;

      function O(t) {
        if (a.call(this, t), this._pendingAnnotations = [], this._mapFeatureAnnotationController = new s(this), this._clustersController = new r(this), window.document) {
          this._node = new k.Node(g.htmlElement("div", {
            class: E
          })), this._shadowDOMSlotController = new _(this._node);
          var e = function (t) {
            var e = g.htmlElement("div", {
              class: L
            });
            if (!g.supportsShadowDOM) return e;
            var i = e.insertBefore;
            return e.insertBefore = function (e, n) {
              i.call(this, e, n);
              var o = e.firstChild,
                s = t.getAssignedElement(o);
              if (s && s.parentNode && 0 === o.assignedNodes().length) {
                var r = s.nextSibling;
                t.hostNode.element.removeChild(s), t.hostNode.element.insertBefore(s, r)
              }
              return e
            }, e
          }(this._shadowDOMSlotController);
          this._sceneGraphNode = new l(e), this._shadowRootNode = g.addShadowRootChild(this._node, i(815)), this._annotationsNode = this._shadowRootNode.addChild(new k.Node(e)), this._oldCenterMode = !1, this._calloutsNode = this._shadowRootNode.addChild(new k.Node(g.htmlElement("div"))), this._calloutsNode.classList.add(T), this._styleHelper = new u(this), this._shadowRootNode.addChild(new k.Node(this._styleHelper.element)), this._annotationDraggingMapPanningController = new o(t)
        } else this._sceneGraphNode = new l
      }

      function P(t, e, i) {
        return new b(t.origin.x - e, t.origin.y - i, t.size.width, t.size.height)
      }
      O.prototype = v.inheritPrototype(a, O, {
        itemConstructor: h,
        itemName: "annotation",
        capitalizedItemName: "Annotation",
        _rtl: !1,
        _selectionDistance: Math.pow(a.prototype._selectionDistance, 2),
        get sceneGraphNode() {
          return this._sceneGraphNode
        },
        isItemExposed: function (t) {
          return t !== this._userLocationAnnotation && !t.memberAnnotations
        },
        _userLocationAnnotation: null,
        get map() {
          return this._map
        },
        get userLocationAnnotation() {
          return this._userLocationAnnotation
        },
        get dragging() {
          return !!this._draggedAnnotation
        },
        set rtl(t) {
          this._rtl !== t && (this._rtl = t, this._selectedItem && this._callout && this._showCalloutForAnnotation(this._selectedItem, !0))
        },
        preAddedAnnotation: function (t) {
          if (!t._impl.updatedPosition()) return !1;
          var e = !t.map,
            i = g.supportsShadowDOM && this._annotationsNode && t._impl.renderedByDOMElement && !t.element.parentNode;
          return i && this._shadowDOMSlotController.appendAssignedElement(t.element, !1), e && t._impl.setDelegate(this), e || i
        },
        resetAnnotation: function (t) {
          g.supportsShadowDOM && this._annotationsNode && t._impl.renderedByDOMElement && t.element.parentNode && this._shadowDOMSlotController.removeAssignedElement(t._impl.elementInAnnotationDOM, !1), -1 === this._items.indexOf(t) && delete t._impl.delegate
        },
        addItems: function (t) {
          if (t = a.prototype.addItems.call(this, t), this._shouldAnnotationBePending()) return t;
          t.sort((function (t, e) {
            return e.coordinate.latitude - t.coordinate.latitude
          }));
          var e = this._map.camera.toMapRect(),
            i = e.size.width,
            n = e.size.height,
            o = e.origin.x - i,
            s = o + 3 * i,
            r = e.origin.y - n,
            l = r + 3 * n,
            h = 0;
          t.forEach((function (t) {
            t._impl.doesAnimate() && t.visible && (t._impl.x + (t._impl.x < o ? 1 : 0) <= s && t._impl.y >= r && t._impl.y <= l && (t._impl.delayRank = h, ++h))
          }));
          var c = Math.min(50 * h, 3e3),
            d = 0 === h ? 0 : c / h;
          return t.forEach((function (t) {
            t._impl.delayMs = t._impl.delayRank * d, delete t._impl.delayRank
          }), this), t
        },
        addWaitingAnnotations: function (t) {
          var e = "function" == typeof t;
          this._waitingAnnotations ? (e && (this._completionCallback = t), window.clearTimeout(this._tileLoadingTimeout), delete this._tileLoadingTimeout, this._waitingAnnotations.forEach((function (t) {
            t.map && this._addAnnotationWaitingForTiles(t, !1, !e)
          }), this), this._updateSceneGraph(), delete this._waitingAnnotations, S.scheduleOnNextFrame(this._checkCompletion.bind(this))) : e && t()
        },
        annotationsInMapRect: function (t) {
          v.checkInstance(t, p, "[MapKit] Map.annotationsInMapRect expects a MapRect as its argument, got `" + t + "` instead.");
          var e = v.mod(t.origin.x, 1),
            i = e + t.size.width,
            n = t.origin.y,
            o = n + t.size.height;
          return this._items.filter((function (t) {
            if (!this.isItemExposed(t)) return !1;
            var s = t._impl.x + (t._impl.x < e ? 1 : 0),
              r = t._impl.y;
            return s >= e && s <= i && r >= n && r <= o
          }), this)
        },
        removeItem: function (t) {
          return t === this._userLocationAnnotation ? (console.warn("[MapKit] Map.removeAnnotation: the user location annotation cannot be removed. Set showsUserLocation to false instead."), t) : a.prototype.removeItem.call(this, t)
        },
        removeUserLocationAnnotation: function () {
          this._userLocationAnnotation && (this._userLocationAnnotation._impl.removedFromMap(), a.prototype.removeAnyItem.call(this, this._userLocationAnnotation), delete this._userLocationAnnotation)
        },
        updateUserLocationAnnotation: function (t, e) {
          if (t.coordinate) {
            var i = this._userLocationAnnotation || new m(t);
            if (this._userLocationAnnotation || (this._userLocationAnnotation = i, this.addItem(i, 0)), t.stale) return delete this._lastGeocoderRequestCoordinate, delete this._lastUserLocationAnnotationSubtitle, void (i._impl.stale = !0);
            if (i._impl.stale = !1, i._impl.setCoordinate(t.coordinate), R) {
              if (!e && this._lastGeocoderRequestCoordinate && this._lastGeocoderRequestCoordinate.latitude === i._impl.coordinate.latitude && this._lastGeocoderRequestCoordinate.longitude === i._impl.coordinate.longitude) return void (this._userLocationAnnotation.subtitle = this._lastUserLocationAnnotationSubtitle)
            } else R = new d;
            this._lastGeocoderRequestCoordinate = i._impl.coordinate.copy(), D(R, i, this)
          }
        },
        mapSizeDidUpdate: function () {
          if (0 !== this._pendingAnnotations.length) {
            var t = this._map.shouldWaitForTilesAndControls();
            this._pendingAnnotations.forEach((function (e) {
              e._impl.isPending && this._addAnnotationWaitingForTiles(e, t)
            }), this), this._updateSceneGraph(), this._pendingAnnotations = []
          }
        },
        updateVisibleAnnotations: function () {
          0 !== this._items.length && (this._updateVisibleAnnotations(this._items), this._updateSceneGraph())
        },
        startDraggingAnnotation: function (t, e) {
          this._map.annotationDraggingWillStart(), this._draggedAnnotation = t, this._pendingDragStart = !0, t.selected && this._hideCallout(t), this._node.classList.add(x), this._draggedAnnotation._impl.node.classList.add(I), this._draggedAnnotation._impl.lift(), this._updateSceneGraph()
        },
        mapNodeTintWasSet: function (t) {
          this._items.forEach((function (t) {
            t._impl.updateLayout()
          }))
        },
        mapTypeDidChange: function () {
          this._mapFeatureAnnotationController.mapTypeDidChange()
        },
        devicePixelRatioDidChange: function () {
          this._items.forEach((function (t) {
            "function" == typeof t._impl.updateGlyphImages && t._impl.updateGlyphImages()
          }))
        },
        styleHelperNodeDidMoveToParent: function (t) {
          if (g.supportsShadowDOM) {
            var e = t.assignedNodes ? t : t.querySelector("slot"),
              i = e && this._shadowDOMSlotController.getAssignedElement(e);
            e && i && i.parentNode && 0 === e.assignedNodes().length && (this._node.element.removeChild(i), this._node.element.appendChild(i))
          }
        },
        getShadowDOMTargetFromEvent: function (t) {
          if (this._shadowRootNode.domNode) return g.getShadowDOMTargetFromEvent(this._shadowRootNode.domNode, t)
        },
        handleEvent: function (t) {
          switch (t.type) {
            case "region-change-start":
              this._nudgeStarted = !0, this._map.public.addEventListener("region-change-end", this);
              break;
            case "region-change-end":
              !this._nudgeStarted && this._nudgeMapToShowCallout() || (delete this._nudgeStarted, this._callout && this._callout.animateIn(), this._map.public.removeEventListener(t.type, this))
          }
        },
        performScheduledUpdate: z,
        addedItem: function (t, e) {
          a.prototype.addedItem.call(this, t, e), t._impl.isWaiting = !0, e && (t._impl.delayRank = 0);
          var i = this._shouldAnnotationBePending(t);
          i && (t._impl.isPending = !0, this._pendingAnnotations.push(t)), this._updateAnnotation(t), t._impl.selected && this._didSelectAnnotation(t), i || this._addAnnotationWaitingForTiles(t, this._map.shouldWaitForTilesAndControls())
        },
        manyItemsAdded: function (t) {
          this._updateSceneGraph()
        },
        removedItem: function (t, e) {
          delete t._impl.wasCollided, "function" == typeof t._impl.node.remove && (g.supportsShadowDOM && t._impl.node.parent && this._shadowDOMSlotController.removeAssignedElement(t._impl.elementInAnnotationDOM, !t._impl.renderedByDOMElement), t._impl.node.remove()), a.prototype.removedItem.call(this, t), t._impl.labelRegion && this._removeLabelRegionForAnnotation(t), e || this._updateVisibleAnnotations([t]), this._clustersController.removedAnnotation(t), t.memberAnnotations || this._updateCollisions(this._items)
        },
        manyItemsRemoved: function (t) {
          this._updateVisibleAnnotations(this.items), this._updateSceneGraph()
        },
        manyItemsChanged: function (t) {
          this._updateVisibleAnnotations(this.items), this._updateSceneGraph()
        },
        removedReferenceToMap: function () {
          this._userLocationAnnotation && this._userLocationAnnotation._impl.removedFromMap()
        },
        pickableItemsCloseToPoint: function (t, e) {
          var i = t.filter((function (t, i) {
            var n = t._impl.distanceToPoint(e);
            return n <= this._selectionDistance && (t._impl.distance = n, t._impl.index = i, !0)
          }), this).sort((function (t, e) {
            return t._impl.distance - e._impl.distance || e._impl.index - t._impl.index
          }));
          return i.forEach((function (t) {
            delete t._impl.distance, delete t._impl.index
          })), i
        },
        annotationDraggingDidChange: function (t) {
          this._draggedAnnotation && !this._draggedAnnotation._impl.shouldPreventDrag && (this._pendingDragStart && (delete this._pendingDragStart, this._draggedAnnotation._impl.draggingDidStart(), this._map.dispatchEventWithAnnotation(c.Events.DragStart, this._draggedAnnotation)), S.scheduleASAP(this), this._draggedAnnotation._impl.setDraggingTranslationForMapFrameSize(t, this._map.ensureRenderingFrame().size), this._annotationDraggingMapPanningController.update(this._draggedAnnotation, this._draggedAnnotation._impl.node))
        },
        annotationDraggingDidEnd: function (t) {
          this._draggedAnnotation && (this._annotationDraggingMapPanningController.stop(), this._draggedAnnotation._impl.dropAfterDraggingAndRevertPosition(!t), this._draggedAnnotation._impl.node.classList.remove(I), this._node.classList.remove(x), this._map.annotationDraggingDidEnd(), this._map.dispatchEventWithAnnotation(c.Events.DragEnd, this._draggedAnnotation), delete this._draggedAnnotation, this._updateSceneGraph())
        },
        annotationPropertyDidChange: function (t, e) {
          if (!(C && t instanceof C)) {
            switch (e) {
              case "selected":
                t.selected ? this._didSelectAnnotation(t) : this._didDeselectAnnotation(t);
                break;
              case "coordinate":
                if (!t._impl.updatedPosition()) return;
                break;
              case "":
              case "displayPriority":
              case "collisionMode":
              case "padding":
                break;
              case "calloutOffset":
                this._updateCalloutPositionWithTailShift(t, !0);
                break;
              case "visible":
                this._selectedItem === t && (this._callout ? this._callout.visible = t.visible : t.visible && this._showCalloutForAnnotation(t, !0)), t._impl.needsColliding = !0;
                break;
              case "draggable":
                this._draggedAnnotation !== t || t.draggable || this._map.stopDraggingAnnotation();
                break;
              default:
                this._selectedItem === t && (this._updateCalloutInfo(t), this._updateCalloutTailShift())
            }
            this._annotationsDidChangeSinceLastCollision = !0, this._updateVisibleAnnotations([t]), this._updateSceneGraph(), this._updateLabelRegionForAnnotation(t)
          }
        },
        mapForAnnotation: function (t) {
          return this._map ? this._map.public : null
        },
        sizeForElement: function (t) {
          if (this._map.isRooted()) return this._styleHelper.sizeForElement(t)
        },
        backgroundColorForElement: function (t, e) {
          return this._styleHelper.backgroundColorForElement(t, e)
        },
        setAnimationForElement: function (t, e, i) {
          return this._styleHelper.setAnimationForElement(t, e, i)
        },
        selectedAnnotationDidMoveToMap: function (t) {
          this._updateSceneGraph(), this._showCalloutForAnnotation(t)
        },
        supportsLabelRegions: function () {
          return this._map.supportsLabelRegions()
        },
        annotationFinishedAnimating: function (t) {
          this._checkCompletion()
        },
        isElementInCallout: function (t) {
          return !!this._callout && this._callout.containsElement(t)
        },
        isElementInCustomCallout: function (t) {
          return !!this._callout && this._callout.isCustomCallout() && this._callout.node.element.contains(t)
        },
        mapPanningDuringAnnotationDrag: z,
        mapSupportForLabelRegionsChanged: function () {
          this._items.forEach((function (t) {
            var e = t._impl;
            e.updateLayout(), delete e.labelRegion, this._updateLabelRegionForAnnotation(t)
          }), this)
        },
        containsMarkerAnnotation: function () {
          return this._items.some((function (t) {
            return "string" == typeof t.glyphText
          }))
        },
        paddingForAnnotation: function (t) {
          var e = 0,
            i = 0;
          t.size ? (e = t.size.width, i = t.size.height) : console.warn("[MapKit] Computing padding for showItems() when an annotation was not yet added the DOM can cause the annotation to not be entirely visible. The `size` property of the annotation can be changed to ensure that it shows up properly.");
          var n = {
            top: t._impl._anchorPoint.y,
            right: e - t._impl._anchorPoint.x,
            bottom: i - t._impl._anchorPoint.y,
            left: t._impl._anchorPoint.x
          };
          if (t === this.selectedItem && this._callout) {
            var o = this._callout.boundingRect,
              s = t._impl.position();
            n.top = Math.max(n.top, s.y - o.minY()), n.right = Math.max(n.right, o.maxX() - s.x), n.bottom = Math.max(n.bottom, o.maxY() - s.y), n.left = Math.max(n.left, s.x - o.minX())
          }
          return n
        },
        calloutNodeDidRemove: function (t) {
          g.supportsShadowDOM && (t.isCustomCallout() && "slot" === t.customOrContentElement.localName && this._shadowDOMSlotController.removeAssignedElement(t.customOrContentElement), t.customLeftAccessory && "slot" === t.customLeftAccessory.localName && this._shadowDOMSlotController.removeAssignedElement(t.customLeftAccessory), t.customRightAccessory && "slot" === t.customRightAccessory.localName && this._shadowDOMSlotController.removeAssignedElement(t.customRightAccessory))
        },
        mapFeatureDidSelect: function (t) {
          this._mapFeatureAnnotationController.mapFeatureDidSelect(t)
        },
        _addAnnotationToMapAsync: function (t) {
          this._addAnnotationToMap(t, !1), this._updateSceneGraph()
        },
        _addAnnotationToMap: function (t, e) {
          if (this._shouldAnnotationBePending()) t._impl.isPending = !0;
          else {
            g.supportsShadowDOM && this._annotationsNode && this._shadowDOMSlotController.appendAssignedElement(t.element, !t._impl.renderedByDOMElement), t._impl.willMoveToMap(t._impl.canAnimate && !e), delete t._impl.timeout, delete t._impl.isWaiting, delete t._impl.canAnimate, delete t._impl.delayMs;
            var i = this._items.indexOf(t);
            this._annotationsNode && this._annotationsNode.addChild(t._impl.node, i), t._impl.sceneGraphNode && this._sceneGraphNode.addChild(t._impl.sceneGraphNode, i), this._updateAnnotation(t), t.selected && this._showCalloutForAnnotation(t), this._updateLabelRegionForAnnotation(t), t._impl.didMoveToMap()
          }
        },
        _addAnnotationWaitingForTiles: function (t, e, i) {
          if ((Object.prototype.hasOwnProperty.call(t._impl, "canAnimate") || (t._impl.canAnimate = !t._impl.isPending), delete t._impl.isPending, e && t !== this._userLocationAnnotation) && !this._items.some((function (t) {
            return t !== this._userLocationAnnotation && t._impl.mayBeDrawn()
          }))) return void (this._waitingAnnotations ? this._waitingAnnotations.push(t) : (this._waitingAnnotations = [t], this._tileLoadingTimeout = window.setTimeout(this.addWaitingAnnotations.bind(this, v.noop), 3e3)));
          !i && t._impl.doesAnimate() && t._impl.delayMs > 0 ? t._impl.timeout = window.setTimeout(this._addAnnotationToMapAsync.bind(this, t), t._impl.delayMs) : this._addAnnotationToMap(t, i)
        },
        _didDeselectAnnotation: function (t) {
          t._impl.node.classList.remove(A), this.selectedItem = null, this._hideCallout(t), this._map.annotationSelectionDidChange(t), this._mapFeatureAnnotationController.annotationSelectionDidChange(t)
        },
        _didSelectAnnotation: function (t) {
          t._impl.node.classList.add(A), this.selectedItem = t, this._map.annotationSelectionDidChange(t), this._mapFeatureAnnotationController.annotationSelectionDidChange(t), t._impl.visible && this._showCalloutForAnnotation(t)
        },
        _boundingRectForSelectedAnnotationAndCallout: function () {
          var t = this._callout.boundingRect,
            e = this._selectedItem._impl.position(),
            i = Math.min(t.minX(), e.x),
            n = Math.min(t.minY(), e.y),
            o = Math.max(t.maxX(), e.x) - i,
            s = Math.max(t.maxY(), e.y) - n;
          return new b(i, n, o, s)
        },
        _updateCalloutTailShift: function (t) {
          if (!this._callout) return !1;
          var e = t ? this._callout.boundingRect.pad(12) : this._boundingRectForSelectedAnnotationAndCallout().pad(12),
            i = this._totalMapNudgingTranslation(e, this._map.ensureVisibleFrame(), t),
            n = i.x,
            o = i.y,
            s = this._callout.shiftTailBy(n);
          return 0 !== n || 0 !== o ? new w(-(n + s), -o) : void 0
        },
        _nudgeMapToShowCallout: function () {
          if (this._map.cameraIsPanning || this._map.cameraIsZooming) return this._map.public.addEventListener("region-change-end", this), !0;
          if (!this._selectedItem._impl.isShown()) return !1;
          var t = this._updateCalloutTailShift();
          return !!t && (this._map.public.addEventListener("region-change-start", this), this._map.translateCameraAnimated(t, !0), this._map.public.removeEventListener("region-change-start", this), !!this._nudgeStarted)
        },
        _translationToFitInFrame: function (t, e) {
          var i = {
            x: 0,
            y: 0
          };
          return (t.maxX() > e.maxX() || t.minX() < e.minX() || t.maxY() > e.maxY() || t.minY() < e.minY()) && (i.x = t.minX() < e.minX() ? t.minX() - e.minX() : t.maxX() > e.maxX() ? t.maxX() - e.maxX() : 0, i.y = t.minY() < e.minY() ? t.minY() - e.minY() : t.maxY() > e.maxY() ? t.maxY() - e.maxY() : 0), i
        },
        _totalMapNudgingTranslation: function (t, e, i) {
          var n = this._translationToFitInFrame(t, e),
            o = this._map.getControlBounds(),
            s = e.midX(),
            r = e.midY(),
            a = 0,
            l = 0;
          return t = P(t, n.x, n.y), o.forEach((function (e) {
            if (t.minX() < e.maxX() && t.maxX() > e.minX() && t.minY() < e.maxY() && t.maxY() > e.minY()) {
              if (a += e.maxX() < s ? t.minX() - e.maxX() : t.maxX() - e.minX(), l += e.maxY() < r ? t.minY() - e.maxY() : t.maxY() - e.minY(), i) return;
              0 !== l && Math.abs(a) > Math.abs(l) ? a = 0 : l = 0, t = P(t, a, l)
            }
          }), this), n.x += a, n.y += l, n
        },
        _hideCallout: function (t, e) {
          t._impl.calloutWillDisappear(), this._callout && (this._callout.node.classList.remove(A), this._callout.animateOut(e), delete this._callout)
        },
        _shouldAnnotationBePending: function () {
          return !this._map.isRooted()
        },
        _showCalloutForAnnotation: function (t, e) {
          if (this._hideCallout(t, e), !t._impl.canShowCallout()) return t._impl.calloutWillAppear(!1);
          var i, n = t._impl.callout;
          if (n && "function" == typeof n.calloutShouldAppearForAnnotation && !f(n.calloutShouldAppearForAnnotation, n, [t], !0)) return t._impl.calloutWillAppear(!1);
          var o, s = n && "function" == typeof n.calloutElementForAnnotation;
          s && (i = f(n.calloutElementForAnnotation, n, [t]), v.checkElement(i, "[MapKit] calloutElementForAnnotation() must return a DOM element, but returned `" + i + "` instead."));
          var r, a = !1;
          if (!i && ((a = n && "function" == typeof n.calloutContentForAnnotation) && (o = f(n.calloutContentForAnnotation, n, [t]), v.checkElement(o, "[MapKit] contentElementForAnnotation() must return a DOM element, but returned `" + o + "` instead.")), !a && !t.title)) return t._impl.calloutWillAppear(!1);
          t._impl.calloutWillAppear(!0);
          var l, h = n && "function" == typeof n.calloutLeftAccessoryForAnnotation;
          h && (r = f(n.calloutLeftAccessoryForAnnotation, n, [t]), v.checkElement(r, "[MapKit] calloutLeftAccessoryForAnnotation() must return a DOM element, but returned `" + r + "` instead."));
          var c = n && "function" == typeof n.calloutRightAccessoryForAnnotation;
          c && (l = f(n.calloutRightAccessoryForAnnotation, n, [t]), v.checkElement(l, "[MapKit] calloutRightAccessoryForAnnotation() must return a DOM element, but returned `" + l + "` instead."));
          var d, u, p = t._impl.ignoreCalloutCornerRadiusForLeftAccessory && !h && !c;
          !h && t._impl.canvasForCalloutAccessory && (r = t._impl.canvasForCalloutAccessory()), g.supportsShadowDOM && (s && (d = "mk-slot-" + Math.random().toString(32).substr(2, 8), i.slot = d, (u = g.htmlElement("slot")).name = d, this._shadowDOMSlotController.appendAssignedElement(i), i = u), a && (d = "mk-slot-" + Math.random().toString(32).substr(2, 8), o.slot = d, (u = g.htmlElement("slot")).name = d, this._shadowDOMSlotController.appendAssignedElement(o), o = u), h && (d = "mk-slot-" + Math.random().toString(32).substr(2, 8), r.slot = d, (u = g.htmlElement("slot")).name = d, this._shadowDOMSlotController.appendAssignedElement(r), r = u), c && (d = "mk-slot-" + Math.random().toString(32).substr(2, 8), l.slot = d, (u = g.htmlElement("slot")).name = d, this._shadowDOMSlotController.appendAssignedElement(l), l = u)), this._callout = new C(this, {
            customElement: i,
            contentElement: o,
            ignoreCalloutCornerRadiusForLeftAccessory: p,
            leftAccessory: this._rtl ? l : r,
            rightAccessory: this._rtl ? r : l,
            rtl: this._rtl
          }), this._callout.animates = !e && (!n || "function" != typeof n.calloutShouldAnimateForAnnotation || !!f(n.calloutShouldAnimateForAnnotation, n, [t], !0));
          var m, _ = s && this._callout.animates && n && "function" == typeof n.calloutAppearanceAnimationForAnnotation ? f(n.calloutAppearanceAnimationForAnnotation, n, [t], "") : "";
          (v.checkType(_, "string", "[MapKit] calloutAppearanceAnimationForAnnotation() must return a string, but returned `" + _ + "` instead."), this._callout.appearanceAnimation = _, i) && (n && "function" == typeof n.calloutAnchorOffsetForAnnotation && (m = f(n.calloutAnchorOffsetForAnnotation, n, [t, this._callout.node.size]), v.checkInstance(m, window.DOMPoint, "[MapKit] calloutAnchorOffsetForAnnotation() must return a DOMPoint, but returned `" + m + "` instead.")), this._callout.setAnchorOffset(m));
          if (this._updateCalloutInfo(t), t === this._userLocationAnnotation) {
            var b = y.getMode(this._map.worldSize, 100);
            if (this._oldCenterMode = b, b) {
              var k = this._callout.getCenterOffset(!0);
              this._callout.animateAnchorOffset(k, -1), this._callout.animateTailScale(0, -1)
            } else this._callout.animateAnchorOffset(new w(0, 0), -1), this._callout.animateTailScale(1, -1)
          }
          this._updateCalloutPositionWithTailShift(t, !1);
          var S = !e && this._nudgeMapToShowCallout();
          this._callout.willMoveToMap(), this._callout.node.classList.add(A), this._calloutsNode.addChild(this._callout.node), this._callout.appearanceAnimation && this._calloutsNode.element.appendChild(this._callout.node.element), S || this._callout.animateIn()
        },
        mapWasDestroyed: function () {
          a.prototype.mapWasDestroyed.call(this), this._annotationDraggingMapPanningController && this._annotationDraggingMapPanningController.mapWasDestroyed(), this._clustersController.mapWasDestroyed(), this._mapWasDestroyed = !0
        },
        _updateCalloutInfo: function (t) {
          this._callout ? this._callout.updateInfo(t, 12) || this._hideCallout(t) : this._showCalloutForAnnotation(t)
        },
        _updateCalloutPositionWithTailShift: function (t, e) {
          this._selectedItem === t && this._callout && (this._callout.setShown(t._impl.isShown()), this._callout.setPosition(t._impl.positionForCallout()), e && this._updateCalloutTailShift(e))
        },
        _updateLabelRegionForAnnotation: function (t) {
          var e = t._impl;
          if (e.shouldHideLabels) {
            e.labelRegion || (e.labelRegion = this._map.createLabelRegion());
            var i = e.labelRegion;
            if (i) {
              var n = e.node.size,
                o = n.width,
                s = n.height;
              i.x = null == e.visibleX ? e.x : e.visibleX, i.y = 1 - e.y, i.width = o, i.height = s, i.xOffset = o / 2 - e._anchorPoint.x - e._anchorOffset.x, i.yOffset = e._anchorPoint.y + e._anchorOffset.y - s / 2, this._map.updatedLabelRegion()
            }
          }
        },
        _removeLabelRegionForAnnotation: function (t) {
          this._map.unregisterLabelRegion(t._impl.labelRegion), delete t._impl.labelRegion
        },
        _updateVisibleAnnotations: function (t, e) {
          e || this._deletePreviousPointForPickingItem();
          var i = this._userLocationAnnotation,
            n = this._map;
          if (i) {
            var o = y.getMode(n.worldSize),
              s = this._selectedItem === i;
            i.isRingMode = o;
            var r = y.getMode(n.worldSize, 100),
              a = this._oldCenterMode !== r;
            if (this._oldCenterMode = r, this._callout && s && a)
              if (this._callout.animateTailScale(r ? 0 : 1), r) {
                var l = this._callout.getCenterOffset();
                l.y = l.y - i._impl._node.size.height / 4, this._callout.animateAnchorOffset(l)
              } else this._callout.animateAnchorOffset(new w(0, 0))
          }
          var h = n.camera.toRenderingMapRect(),
            c = h.size.width,
            d = Math.min(1.5 * c, .5),
            u = h.midX(),
            p = h.size.height,
            m = h.minY() - p,
            g = m + 3 * p;
          t.forEach((function (t) {
            if (t !== this._draggedAnnotation || !this._annotationDraggingMapPanningController.panning) {
              var e = NaN,
                i = t._impl.y;
              if (c > 0 && p > 0 && i >= m && i <= g)
                for (var o = t._impl.x, s = t.anchorOffset.x / n.worldSize, r = d, a = -1; a <= 1; ++a) {
                  var l = Math.abs(o - s + a - u);
                  l < r && (r = l, e = o + a)
                }
              isNaN(e) ? t._impl.setShown(!1) : (t._impl.isShown() || t !== this._selectedItem || this._showCalloutForAnnotation(t, !0), t._impl.setShown(!0), t._impl.setPosition(n.adjustMapItemPoint(n.camera.transformMapPoint(new w(e, i)))), t._impl.visibleX !== e && (t._impl.visibleX = e, this._updateLabelRegionForAnnotation(t)))
            }
          }), this), this._updateCalloutPositionWithTailShift(this._selectedItem, !0), e || this._updateCollisions(t)
        },
        _updateCollisions: function (t) {
          var e = !1,
            i = this._items.filter((function (t) {
              var i = t.visible && t._impl.isShown(),
                n = i || t._impl.needsColliding;
              return delete t._impl.needsColliding, n && (t.displayPriority < h.DisplayPriority.Required || t.clusteringIdentifier) && (e = !0), n && i && !t.memberAnnotations
            }), this);
          if (e) {
            var n = this._map;
            this._clustersController.collideAnnotations(i, n.zoomLevel, n.rotation, this._annotationsDidChangeSinceLastCollision)
          }
          this._annotationsDidChangeSinceLastCollision = !1
        },
        addCluster: function (t) {
          try {
            var e = "function" == typeof this._map.annotationForCluster ? f(this._map._annotationForCluster, this._map.public, [t], t) : t;
            e = this._clustersController.setRequiredClusterAnnotationProperties(e, t), this.addItem(e)
          } catch (i) {
            console.warn("[MapKit] annotationForCluster: the following error occurred; reverting to default annotation: " + i), e = this.addItem(t)
          }
          return e._impl.customCluster = e !== t, e._impl.updateLayout(!0), e
        },
        willUpdateCollisions: function () {
          this._items.forEach((function (t) {
            t._impl.wasOccluded = t._impl.occluded, t._impl.previousCluster = t._impl.cluster
          }))
        },
        didUpdateCollisions: function () {
          this._items.forEach((function (t) {
            var e = t._impl;
            e.wasCollided || e.occluded || (e.wasCollided = !0), t.memberAnnotations && t.memberAnnotations[0]._impl.cluster !== t && (e.cluster = e.memberAnnotations[0]._impl.cluster), e.updateVisibility(e.occluded), e.occluded !== e.wasOccluded && e.animateOcclusion(), delete e.previousCluster, e.shouldHideLabels && (e.occluded || e.labelRegion ? e.occluded && e.labelRegion && this._removeLabelRegionForAnnotation(t) : this._updateLabelRegionForAnnotation(t))
          }), this), this._items.forEach((function (t) {
            delete t._impl.wasOccluded
          })), this._updateVisibleAnnotations(this._items, !0), this._updateSceneGraph()
        },
        deselectClusterAnnotation: function () {
          this._selectedItem && this._selectedItem.memberAnnotations && (this._selectedItem.selected = !1)
        },
        _updateAnnotation: function (t) {
          t._impl.updatedPosition() && this._updateVisibleAnnotations([t])
        },
        _updateSceneGraph: function () {
          var t = this._selectedItem,
            e = this._draggedAnnotation,
            i = this._items.filter((function (i) {
              return i._impl.isDrawn() && i !== t && i !== e
            })).map((function (t) {
              return t._impl.sceneGraphNode
            }));
          t && t._impl.isDrawn() && i.push(t._impl.sceneGraphNode), e && e._impl.isDrawn() && i.push(e._impl.sceneGraphNode), this._sceneGraphNode.children = i
        },
        _checkCompletion: function () {
          this._mapWasDestroyed || (this._annotationsDidChangeSinceLastCollision = !0, this._updateVisibleAnnotations(this._items), this._updateSceneGraph(), this._completionCallback && (this._items.some((function (t) {
            return !t._impl.isStable()
          })) || "function" != typeof this._completionCallback || (this._completionCallback(), delete this._completionCallback)))
        }
      });
      var D = M((function (t, e, i) {
        i._geocoderRequestId && t.cancel(i._geocoderRequestId);
        var n = i._geocoderRequestId = t.reverseLookup(e._impl.coordinate, (function (t, o) {
          n === i._geocoderRequestId && (delete i._geocoderRequestId, t ? (console.error("[MapKit] Error getting address for user location: " + t.message), e.subtitle = null) : o.results.length > 0 ? i._lastUserLocationAnnotationSubtitle = e.subtitle = o.results[0].formattedAddress : e.subtitle = null)
        }))
      }), 1e3);

      function z() {
        if (this._draggedAnnotation && !this._mapWasDestroyed) {
          var t = this._draggedAnnotation._impl.dispatchDraggingEvent();
          this._map.dispatchEventWithAnnotation(t.type, this._draggedAnnotation, {
            coordinate: t.coordinate
          })
        }
      }
      t.exports = O
    },
    9171: (t, e, i) => {
      var n = i(6922),
        o = i(210),
        s = i(1593),
        r = i(4140),
        a = i(270),
        l = i(9477),
        h = i(3658),
        c = i(2114),
        d = i(4937),
        u = 10.5,
        p = 3.5826363,
        m = 3.58028186,
        g = 277 / 249,
        _ = 237 / 249,
        f = "white",
        y = {
          left: 10,
          right: 10,
          content: {
            left: 4,
            right: 4
          }
        },
        v = {
          left: 7.5,
          right: 10
        },
        w = {
          left: 7.5,
          right: 7.5
        },
        b = 5.5,
        C = 0,
        k = "mk-callout",
        S = "mk-bubble",
        M = "mk-title",
        E = "mk-subtitle",
        L = "mk-no-subtitle",
        T = "mk-no-accessories",
        x = "mk-standard",
        A = "mk-callout-accessory",
        I = "mk-callout-content",
        R = "mk-custom-content",
        O = "mk-callout-accessory-content",
        P = "mk-rtl";

      function D(t) {
        a.Node.call(this, h.htmlElement("div", {
          class: k,
          style: "direction: ltr"
        })), this._callout = t
      }

      function z(t, e) {
        n.call(this), this.delegate = t, this._rtl = e.rtl, this._node = new D(this);
        var i = this._node.element;

        function o(e) {
          return t.backgroundColorForElement(e, !0)
        }

        function s(t, e) {
          var i = h.htmlElement("div", {
            class: O
          }, t);
          return i.style.maxWidth = "186.5px", e && (i.style.padding = "0"), h.htmlElement("div", {
            class: A
          }, i)
        }
        e.customElement ? (this._containerElement = this._customElement = e.customElement, this.setSize(this.delegate.sizeForElement(this._customElement)), i.appendChild(e.customElement)) : (this._ignoreCalloutCornerRadiusForLeftAccessory = e.ignoreCalloutCornerRadiusForLeftAccessory, this._tailScale = e.tailScale || 1, this._bubbleElement = h.svgElement("path"), this._svgElement = i.appendChild(h.svgElement("svg", {
          class: S
        }, this._bubbleElement)), this._containerElement = h.htmlElement("div"), this._containerElementNode = new a.Node(this._containerElement), e.leftAccessory && (this._leftAccessoryBackgroundColor = o(e.leftAccessory), this._leftAccessory = s(e.leftAccessory, !this._rtl && this._ignoreCalloutCornerRadiusForLeftAccessory), this._containerElement.appendChild(this._leftAccessory)), this._containerContentElement = this._containerElement.appendChild(h.htmlElement("div")), this._containerContentElement.className = I, e.rightAccessory && (this._rightAccessoryBackgroundColor = o(e.rightAccessory), this._rightAccessory = s(e.rightAccessory, this._rtl && this._ignoreCalloutCornerRadiusForLeftAccessory), this._containerElement.appendChild(this._rightAccessory)), (this._leftAccessoryBackgroundColor || this._rightAccessoryBackgroundColor) && (this._calloutId = F(), this._linearGradientElement = h.svgElement("linearGradient", {
          id: this._calloutId
        }), this._svgElement.appendChild(h.svgElement("defs", this._linearGradientElement))), e.contentElement ? this._setContentElement(e.contentElement) : (this._containerElementNode.classList.add(x), e.rtl && (this._containerContentElement.className += " " + P)), i.appendChild(this._containerElement)), e.position && this.setPosition(e.position), this._node.wantsHardwareCompositing = !0
      }

      function N(t, e, i) {
        var n = 17 * e,
          o = 13 * e,
          s = t.width / 2 - n,
          r = 10 * e,
          a = 12 * e;
        return "M0,10.5c0,-6.9197181400000005 3.5826363,-10.5 10.5,-10.5h" + t.width + "c6.9173637,0 " + "10.5," + m + " " + "10.5," + "10.5v" + t.height + "c0,6.9197181400000005 " + -p + "," + "10.5 " + "-10.5," + "10.5h" + (-i - s) + "c" + -r + ",0 " + -a + "," + o + " " + -n + "," + o + "c" + (a - n) + ",0 " + (r - n) + "," + -o + " " + -n + "," + -o + "h" + (i - s) + "c" + "-6.9173637,0 " + "-10.5," + -m + " " + "-10.5," + "-10.5z"
      }

      function F() {
        var t = Math.random().toString(36).substr(2);
        return document.getElementById(t) ? F() : t
      }
      D.prototype = c.inheritPrototype(a.Node, D, {
        constructor: D,
        didMoveToParent: function (t) {
          null === t && this._callout.didRemoveFromParent()
        }
      }), z.prototype = c.inheritPrototype(n, z, {
        _tailShift: 0,
        get node() {
          return this._node
        },
        get boundingRect() {
          var t = this._node.position;
          return new s(t.x, t.y, this._node.size.width, this._node.size.height)
        },
        delegate: null,
        willMoveToMap: function () {
          this._node.transform = (new l).scale(0)
        },
        setAnchorOffset: function (t) {
          this._anchorOffset = t ? new window.DOMPoint(t.x, t.y) : new window.DOMPoint
        },
        containsElement: function (t) {
          if (t === this._svgElement) return !1;
          if (this._containerElement.contains(t)) return !0;
          if (!h.supportsShadowDOM || !this.isCustomCallout()) return !1;
          var e = this.customOrContentElement.assignedNodes()[0];
          return !!e && e.contains(t)
        },
        isCustomCallout: function () {
          return !!this.customOrContentElement
        },
        get customOrContentElement() {
          return this._customElement || this._contentElement
        },
        get customLeftAccessory() {
          if (this._leftAccessory) return this._leftAccessory.firstChild.firstChild
        },
        get customRightAccessory() {
          if (this._rightAccessory) return this._rightAccessory.firstChild.firstChild
        },
        updateInfo: function (t, e) {
          if (this.isCustomCallout()) return !0;
          if (!t || !t.title) return !1;
          this._containerContentElement.innerHTML = "", this._containerElement.style.width = "", this._containerContentElement.appendChild(h.htmlElement("div", {
            class: M,
            dir: "auto"
          }, t.title)), t.subtitle ? (this._containerContentElement.appendChild(h.htmlElement("div", {
            class: E,
            dir: "auto"
          }, t.subtitle)), this._containerElementNode.classList.remove(L)) : (this._containerElementNode.classList.add(L), this._containerElementNode.classList.toggle(T, !this._leftAccessory && !this._rightAccessory)), this._updateAccessoryViews(), this._containerElement.className = this._containerElementNode.classList.toString();
          var i = this.delegate.sizeForElement(this._containerElement),
            n = t.map._impl.ensureVisibleFrame().size.width - 2 * e - this._extraWidth(this._ignoreCalloutCornerRadiusForLeftAccessory);
          return i.width = c.clamp(i.width, 74, c.clamp(n, 74, 373)), 0 !== this._accessoryHeight && (i.height = Math.max(this._accessoryHeight, i.height)), this._updateSize(i, !1), this.updatePosition(), !0
        },
        shiftTailBy: function (t) {
          if (this._customElement) return 0;
          var e = Math.max(0, (this._bubbleSize.width - 74 - u) / 2);
          return this._tailShift = t < 0 ? Math.min(e, -t) : -Math.min(e, t), this._bubbleElement.setAttribute("d", N(this._bubbleSize, this._tailScale, this._tailShift)), this._node.position = new o(this._node.position.x + this._tailShift, this._node.position.y), this._tailShift
        },
        animateIn: function () {
          if (!this.animates || this.animates && this._customElement && !this.appearanceAnimation) this._node.transform = new l;
          else {
            if (this._appearanceAnimationName) return this._node.transform = new l, void this.delegate.setAnimationForElement(this._containerElement, this._appearanceAnimation, this._appearanceAnimationName);
            this._scaleXOffset = -this._tailShift, this._scaleYOffset = this._node.size.height / 2, this._scaleAnimationParameterIndex = 0, this._scaleAnimationStartDate = Date.now(), d.scheduleOnNextFrame(this)
          }
        },
        animateOut: function (t) {
          !t && this.visible ? (this._scaleAnimationStartDate && this._finishAnimatingScale(), this._fadeoutAnimationStartDate = Date.now(), d.scheduleOnNextFrame(this)) : this._node.remove()
        },
        performScheduledUpdate: function () {
          this._scaleAnimationStartDate && this._animateScale(), this._fadeoutAnimationStartDate && this._animateFadeout(), this._tailAnimation && this._animateTail(), this._anchorOffsetAnimation && this._animateAnchorOffset()
        },
        didRemoveFromParent: function () {
          this.delegate.calloutNodeDidRemove(this)
        },
        setSize: function (t) {
          this._svgElement && (this._svgElement.style.width = t.width + "px", this._svgElement.style.height = t.height + "px", this._svgElement.setAttribute("viewBox", "-0.5 -0.5 " + t.width + " " + t.height)), n.prototype.setSize.call(this, t)
        },
        _updateSize: function (t, e) {
          var i = this._ignoreCalloutCornerRadiusForLeftAccessory,
            n = t.width - this.node.size.width - 22;
          this._tailShift = Math.max(0, this._tailShift + Math.min(0, n)), this._containerElement.style.width = t.width + "px";
          var o = this._extraWidth(i),
            s = 13 * this._tailScale,
            a = 22 + s;
          t.width += o;
          var l = t.height,
            h = (i ? 55 : 50) + s;
          t.height += a, t.height -= u, t.height = e ? t.height : Math.max(t.height, h);
          var c = e ? C : b,
            d = (t.height - l - s) / 2;
          this._containerElement.style.top = l / 2 + Math.max(c, d) + "px";
          var p, m = w.left,
            g = w.right;
          this._containerElement.style.left = m + "px", this.setSize(t), this._bubbleSize = new r(t.width - 22, t.height - 22 - s), this._bubbleElement.setAttribute("d", N(this._bubbleSize, this._tailScale, this._tailShift)), this._leftAccessoryBackgroundColor && (p = 100 * (this._leftAccessoryWidth + m) / t.width, this._updateAccessoryViewBackground(p, this._leftAccessoryBackgroundColor, f)), this._rightAccessoryBackgroundColor && (p = 100 - 100 * (this._rightAccessoryWidth + g) / t.width, this._updateAccessoryViewBackground(p, f, this._rightAccessoryBackgroundColor))
        },
        _extraWidth: function (t) {
          return t ? v.left + v.right : y.left + y.right - y.content.left
        },
        _updateAccessoryViews: function () {
          if (this._accessoryHeight = 0, this._leftAccessory) {
            var t = this.delegate.sizeForElement(this._leftAccessory.children[0]);
            this._leftAccessoryWidth = (!this._rtl && this._ignoreCalloutCornerRadiusForLeftAccessory ? 0 : u) + t.width, this._accessoryHeight = t.height, this._leftAccessory.style.width = this._leftAccessoryWidth + "px", this._ignoreCalloutCornerRadiusForLeftAccessory && !this._rtl && (this._leftAccessory.style.height = this._leftAccessoryWidth + "px", this._leftAccessory.style.overflow = "visible"), this._containerContentElement.style.marginLeft = this._leftAccessoryWidth + "px"
          }
          if (this._rightAccessory) {
            var e = this.delegate.sizeForElement(this._rightAccessory.children[0]);
            this._rightAccessoryWidth = (this._rtl && this._ignoreCalloutCornerRadiusForLeftAccessory ? 0 : u) + e.width, this._accessoryHeight = Math.max(this._accessoryHeight, e.height), this._rightAccessory.style.width = this._rightAccessoryWidth + "px", this._ignoreCalloutCornerRadiusForLeftAccessory && this._rtl && (this._rightAccessory.style.height = this._rightAccessoryWidth + "px", this._rightAccessory.style.overflow = "visible"), this._containerContentElement.style.marginRight = this._rightAccessoryWidth + "px"
          }
        },
        _updateAccessoryViewBackground: function (t, e, i) {
          this._linearGradientElement.appendChild(h.svgElement("stop", {
            offset: t + "%",
            "stop-color": "" + e
          })), this._linearGradientElement.appendChild(h.svgElement("stop", {
            offset: t + "%",
            "stop-color": "" + i
          })), this._bubbleElement.style.fill = "url(#" + this._calloutId + ")"
        },
        _setContentElement: function (t) {
          this._updateAccessoryViews(), this._contentElement = t, this._containerContentElement.appendChild(h.htmlElement("div", t)), this._containerElementNode.classList.add(R), this._containerElement.className = this._containerElementNode.classList.toString();
          var e = this.delegate.sizeForElement(this._containerElement);
          e.height = Math.max(e.height, this._accessoryHeight), this._updateSize(e, !0)
        },
        _scaleAnimationParameters: [
          [8e3 / 60, 30 / 249, g],
          [5e3 / 60, g, _],
          [5e3 / 60, _, 1]
        ],
        _animateScale: function () {
          var t = this._scaleAnimationParameters[this._scaleAnimationParameterIndex],
            e = t[0],
            i = t[1],
            n = t[2],
            o = Date.now(),
            s = Math.min((o - this._scaleAnimationStartDate) / e, 1),
            r = i + (n - i) * s;
          if (this._node.transform = (new l).translate(this._scaleXOffset, this._scaleYOffset).scale(r).translate(-this._scaleXOffset, -this._scaleYOffset), 1 === s) {
            if (++this._scaleAnimationParameterIndex, !(this._scaleAnimationParameterIndex < this._scaleAnimationParameters.length)) return void this._finishAnimatingScale();
            this._scaleAnimationStartDate = o
          }
          d.scheduleOnNextFrame(this)
        },
        _finishAnimatingScale: function () {
          delete this._scaleXOffset, delete this._scaleYOffset, delete this._scaleAnimationStartDate, delete this._scaleAnimationParameterIndex
        },
        _animateFadeout: function () {
          var t = (Date.now() - this._fadeoutAnimationStartDate) / 100,
            e = Math.max(0, 1 - t);
          0 !== e ? (this._node.opacity = e, d.scheduleOnNextFrame(this)) : this._node.remove()
        },
        animateTailScale: function (t, e) {
          var i = (new Date).getTime();
          e = e || 0 === e ? e : 500, this._tailAnimation = {
            timeStart: i,
            timeEnd: i + e,
            valueStart: this._tailScale,
            valueEnd: t
          }, this._animateTail()
        },
        _animateTail: function () {
          if (this._tailAnimation) {
            var t = (new Date).getTime(),
              e = this._tailAnimation.timeStart,
              i = this._tailAnimation.timeEnd,
              n = this._tailAnimation.valueStart,
              o = this._tailAnimation.valueEnd,
              s = i <= e ? 1 : (t - e) / (i - e),
              a = h.easeInOut(c.clamp(s, 0, 1)),
              l = h.lerp(a, n, o),
              u = 13 * (l - this._tailScale);
            this._tailScale = l, this.setSize(new r(this.node.size.width, this.node.size.height + u)), this._bubbleElement.setAttribute("d", N(this._bubbleSize, this._tailScale, this._tailShift)), t < i ? d.scheduleOnNextFrame(this) : this._tailAnimation = null
          }
        },
        animateAnchorOffset: function (t, e) {
          var i = (new Date).getTime();
          e = e || 0 === e ? e : 500, this._anchorOffsetAnimation = {
            timeStart: i,
            timeEnd: i + e,
            startX: this._anchorOffset.x,
            startY: this._anchorOffset.y,
            endX: t.x,
            endY: t.y
          }, this._animateAnchorOffset()
        },
        _animateAnchorOffset: function () {
          if (this._anchorOffsetAnimation) {
            var t = (new Date).getTime(),
              e = this._anchorOffsetAnimation.timeStart,
              i = this._anchorOffsetAnimation.timeEnd,
              n = this._anchorOffsetAnimation.startX,
              o = this._anchorOffsetAnimation.endX,
              s = this._anchorOffsetAnimation.startY,
              r = this._anchorOffsetAnimation.endY,
              a = i <= e ? 1 : (t - e) / (i - e),
              l = h.easeInOut(c.clamp(a, 0, 1)),
              u = h.lerp(l, n, o),
              p = h.lerp(l, s, r);
            this._anchorOffset.x = u, this._anchorOffset.y = p, this.updatePosition(), t < i ? d.scheduleOnNextFrame(this) : this._anchorOffsetAnimation = null
          }
        },
        getCenterOffset: function (t) {
          var e = 13 * this._tailScale,
            i = this._node.size;
          return new o(0, (e - i.height - (t ? 13 : 0)) / 2)
        }
      }), t.exports = z
    },
    5512: (t, e, i) => {
      var n = i(5077),
        o = i(9536),
        s = i(2114),
        r = i(1232),
        a = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);

      function l(t, e, i, n) {
        this._memberAnnotations = i, o.call(this, t, e, n)
      }
      l.prototype = s.inheritPrototype(o, l, {
        get memberAnnotations() {
          return this._memberAnnotations
        },
        get n() {
          return this._memberAnnotations.length
        },
        get title() {
          return a(this, "_title") ? this._title : this._topAnnotation.title
        },
        set title(t) {
          Object.getOwnPropertyDescriptor(n.prototype, "title").set.call(this, t)
        },
        get subtitle() {
          var t = this.n - 1;
          return a(this, "_subtitle") ? this._subtitle : r.get("Annotation.Clustering.More" + (t > 1 ? ".Plural" : ""), {
            n: r.digits(t)
          })
        },
        set subtitle(t) {
          Object.getOwnPropertyDescriptor(n.prototype, "subtitle").set.call(this, t)
        },
        get glyphText() {
          return a(this, "_glyphText") ? this._glyphText : a(this, "_glyphImage") || a(this, "_selectedGlyphImage") ? "" : r.digits(this.n)
        },
        set glyphText(t) {
          Object.getOwnPropertyDescriptor(o.prototype, "glyphText").set.call(this, t)
        },
        get draggable() {
          return !1
        },
        get displayPriority() {
          return this._topAnnotation.displayPriority
        },
        get clusteringIdentifier() {
          return this._topAnnotation.clusteringIdentifier
        },
        get _topAnnotation() {
          return this._memberAnnotations[0]
        },
        get _showDefaultAltText() {
          return a(this, "_glyphText") || a(this, "_glyphImage") || a(this, "_selectedGlyphImage")
        },
        get isGlyphImagePOIIcon() {
          return !!this._topAnnotation._impl.isGlyphImagePOIIcon
        },
        updateLocalizedText: function () {
          n.prototype.updateLocalizedText.call(this), this.updateGlyph(), this._sceneGraphNode.updateAppearance(!0)
        },
        altText: function () {
          return this._showDefaultAltText ? n.prototype.altText.call(this) : this.title ? r.get("Annotation.Clustering.AccessibilityLabel", {
            n: this.glyphText,
            title: this.title,
            subtitle: this.subtitle
          }) : r.get("Annotation.Clustering.NoTitle.AccessibilityLabel", {
            n: this.glyphText,
            subtitle: this.subtitle
          })
        }
      }), t.exports = l
    },
    8300: (t, e, i) => {
      var n = i(9389),
        o = i(2114);

      function s(t, e, n) {
        var o = i(5512);
        Object.defineProperty(this, "_impl", {
          value: new o(this, t, e, n)
        })
      }
      var r = function () {
        throw new TypeError("[MapKit] ClusterAnnotation may not be constructed.")
      };
      s.prototype = r.prototype = o.inheritPrototype(n, r, {
        get memberAnnotations() {
          return this._impl.memberAnnotations
        }
      }), t.exports = s
    },
    3655: (t, e, i) => {
      var n = i(6074),
        o = i(8300),
        s = i(9601),
        r = i(2114),
        a = i(4937);

      function l(t) {
        this._annotationsController = t, this._clusters = [], this._previousClusters = [], this._previousOverlaps = [], this._previousAnnotations = [], this._frameCounter = 0
      }

      function h(t, e) {
        var i = n.DisplayPriority.Required,
          o = t.selected ? i : t.displayPriority;
        return (e.selected ? i : e.displayPriority) - o || e._impl.boundingBox.y2 - t._impl.boundingBox.y2
      }

      function c(t, e) {
        return e.displayPriority - t.displayPriority || t._impl.index - e._impl.index
      }

      function d(t, e) {
        return t._impl.collisionMode === n.CollisionMode.None || e._impl.collisionMode === n.CollisionMode.None ? 0 : t._impl.boundingBox.x1 - e._impl.boundingBox.x1
      }

      function u(t) {
        var e = t._impl.node,
          i = t._impl.nodePosition(),
          o = t.padding,
          s = e.size,
          r = s.width,
          a = s.height,
          l = {
            x1: i.x + o.left,
            x2: i.x + r - o.right,
            y1: i.y + o.top,
            y2: i.y + a - o.bottom
          };
        return t._impl.collisionMode === n.CollisionMode.Circle && (l.cx = (l.x1 + l.x2) / 2, l.cy = (l.y1 + l.y2) / 2, l.r = Math.min(r, a) / 2), l
      }

      function p(t, e) {
        var i = {
          x1: t.x1 - e,
          x2: t.x2 + e,
          y1: t.y1 - e,
          y2: t.y2 + e
        };
        return Object.prototype.hasOwnProperty.call(t, "r") && (i.r = t.r + e, i.cx = t.cx, i.cy = t.cy), i
      }

      function m(t, e) {
        var i = t.cx - r.clamp(t.cx, e.x1, e.x2),
          n = t.cy - r.clamp(t.cy, e.y1, e.y2);
        return i * i + n * n <= t.r * t.r
      }

      function g(t, e) {
        t._impl.occluded = e, t._impl.updateVisibility(e)
      }
      l.prototype = {
        collideAnnotations: function (t, e, i, n) {
          this._locked || (this._annotations = t, this._zoomLevel = e, this._rotation = i, this._changesSinceLastCollision = n, a.scheduleOnNextFrame(this))
        },
        setRequiredClusterAnnotationProperties: function (t, e) {
          return t !== e && (t || (t = e), t.coordinate = e.coordinate, t.draggable = !1, t.displayPriority = e.memberAnnotations[0].displayPriority, t.clusteringIdentifier = e.memberAnnotations[0].clusteringIdentifier, t.selected = !1, Object.defineProperty(t, "memberAnnotations", {
            enumerable: !0,
            get: function () {
              return this._impl.memberAnnotations
            }
          }), Object.defineProperty(t._impl, "memberAnnotations", {
            enumerable: !0,
            value: e.memberAnnotations
          })), t.animates = e.memberAnnotations.some((function (t) {
            return !t._impl.wasCollided
          })), t
        },
        removedAnnotation: function (t) {
          t.memberAnnotations || (this._previousClusters = this._previousClusters.filter((function (e) {
            if (e.memberAnnotations.indexOf(t) < 0) return !0;
            this._annotationsController.removeAnyItem(e)
          }), this))
        },
        mapWasDestroyed: function () {
          this._annotationsController = null
        },
        performScheduledUpdate: function () {
          if (this._annotationsController)
            if (this._frameCounter = (this._frameCounter + 1) % 10, 1 === this._frameCounter) {
              var t = this._needsUpdate();
              if (t) {
                this._changesSinceLastCollision = !1, this._previousZoomLevel = this._zoomLevel, this._previousRotation = this._rotation, this._previousAnnotations = this._annotations.slice(), this._locked = !0, this._annotationsController.willUpdateCollisions(), "region" === t && this._annotationsController.deselectClusterAnnotation(), this._overlaps = [];
                for (var e = 0, i = 0, o = this._annotations.length; i < o; ++i) {
                  var s = this._annotations[i];
                  if (s._impl.needsLayout) return this._frameCounter = 0, this._locked = !1, void a.scheduleOnNextFrame(this);
                  s._impl.index = i, s._impl.occluded = !1, s._impl.previousCluster = s._impl.cluster, delete s._impl.cluster, s._impl.collisionMode !== n.CollisionMode.None && (s._impl.boundingBox = u(s), e = Math.max(e, s._impl.boundingBox.x2 - s._impl.boundingBox.x1))
                }
                var r = this._annotations.sort(d),
                  l = {};
                r.forEach((function (t) {
                  if (!t.selected && t._impl.collisionMode !== n.CollisionMode.None) {
                    var e = t.clusteringIdentifier;
                    e && (l[e] ? l[e].push(t) : l[e] = [t])
                  }
                }));
                var h = this._clusters;
                for (var c in this._clusters = [], l) l[c].length > 1 && (e = this._clusterAnnotationsWithMaxWidth(l[c], e));
                h.forEach((function (t) {
                  this._clusters.indexOf(t) < 0 && (g(t, !0), t.selected && (t.selected = !1))
                }), this), this._collideAnnotationsAndClusters(r, e), this._previousOverlaps = this._overlaps, this._annotationsController.didUpdateCollisions(), this._locked = !1
              }
            } else a.scheduleOnNextFrame(this)
        },
        _clusterAnnotationsWithMaxWidth: function (t, e) {
          for (var i = 0; i < t.length;) {
            var o = t[i];
            if (o._impl.cluster) ++i;
            else {
              var s = o._impl.boundingBox.x2,
                r = [o],
                a = i + 1;
              if (o.memberAnnotations && i > 0) {
                var l = o._impl.boundingBox.x1 - e;
                for (a = i - 1; a > 0 && t[a]._impl.boundingBox.x1 >= l;) a -= 1
              }
              for (; a < t.length && t[a]._impl.boundingBox.x1 <= s; ++a) {
                var h = t[a];
                !h._impl.cluster && a !== i && this._annotationsOverlapExcludingSelected(o, h) && r.push(h)
              }
              if (r.length > 1) {
                r = r.reduce((function (t, e) {
                  return e.memberAnnotations ? (t = t.concat(e.memberAnnotations), e._impl.cluster = !0, g(e, !0)) : t.push(e), t
                }), []).sort(c);
                var d = this._clusterAnnotationForMemberAnnotations(r);
                for (d._impl.occluded = !1, d._impl.collisionMode !== n.CollisionMode.None && (d._impl.boundingBox = u(d), e = Math.max(e, d._impl.boundingBox.x2 - d._impl.boundingBox.x1)), delete d._impl.cluster, a = 0; a < r.length; ++a) r[a]._impl.occluded = !0, r[a]._impl.cluster = d;
                for (a = 0; a < t.length && t[a]._impl.boundingBox.x1 < d._impl.boundingBox.x1;) a += 1;
                t.splice(a, 0, d), i = Math.min(i + 1, a)
              } else ++i
            }
          }
          return t.forEach((function (t) {
            t.memberAnnotations && !t._impl.cluster && (this._clusters.push(t), t.map || this._annotationsController.addItem(t))
          }), this), e
        },
        _collideAnnotationsAndClusters: function (t, e) {
          for (var i = !1, o = [], s = 0, r = 0, a = t.length, l = this._clusters.length; s < a || r < l;) {
            var h = t[s],
              c = this._clusters[r];
            h ? h._impl.cluster || h._impl.collisionMode === n.CollisionMode.None ? ++s : c && c._impl.boundingBox.x1 < h._impl.boundingBox.x1 ? (c._impl.isRequired() || (i = !0), o.push(c), ++r) : (h._impl.isRequired() || (i = !0), o.push(h), ++s) : (c._impl.isRequired() || (i = !0), o.push(c), ++r)
          }
          i && this._collideAnnotationsWithMaxWidth(o, e)
        },
        _collideAnnotationsWithMaxWidth: function (t, e) {
          for (var i = [], n = 0, o = t.length; n < o; ++n) {
            var s = t[n];
            0;
            for (var r = s._impl.boundingBox.x2, a = n + 1; a < o; ++a) {
              var l = t[a];
              if (l._impl.boundingBox.x1 > r) break;
              s._impl.isRequired() && l._impl.isRequired() || this._annotationsOverlap(s, l) && i.push(h(s, l) <= 0 ? [s, l] : [l, s])
            }
          }
          i.sort((function (t, e) {
            return h(t[0], e[0])
          })).forEach((function (t) {
            t[0]._impl.occluded || (t[1]._impl.occluded = !0)
          }))
        },
        _annotationsOverlapExcludingSelected: function (t, e) {
          return !t.selected && !e.selected && this._annotationsOverlap(t, e)
        },
        _annotationsOverlap: function (t, e) {
          if (t._impl.isLifted() || e._impl.isLifted()) return !1;
          for (var i, n = c(t, e) <= 0 ? [t, e] : [e, t], o = 0, s = this._previousOverlaps.length; o < s && !i; ++o) {
            var r = this._previousOverlaps[o];
            r[0] === n[0] && r[1] === n[1] && (i = r)
          }
          var a = function (t, e, i) {
            0;
            var n = t._impl.boundingBox,
              o = e._impl.boundingBox;
            i && (n = p(n, 5), o = p(o, 5));
            return function (t, e) {
              if (!(e.x2 >= t.x1 && e.x1 <= t.x2 && e.y2 >= t.y1 && e.y1 <= t.y2)) return !1;
              if (Object.prototype.hasOwnProperty.call(t, "r")) {
                if (Object.prototype.hasOwnProperty.call(e, "r")) {
                  var i = t.cx - e.cx,
                    n = t.cy - e.cy,
                    o = Math.sqrt(i * i + n * n);
                  return t.r + e.r >= o
                }
                return m(t, e)
              }
              if (Object.prototype.hasOwnProperty.call(e, "r")) return m(e, t);
              return !0
            }(n, o)
          }(t, e, i);
          return a && this._overlaps.push(n), a
        },
        _clusterAnnotationForMemberAnnotations: function (t) {
          var e, i = function (t, e) {
            for (var i = 0, n = t.length; i < n; ++i) {
              var o = t[i],
                s = e.length;
              if (o.memberAnnotations.length === s) {
                for (var r = 0; r < s && e[r] === o.memberAnnotations[r];) r += 1;
                if (r === s) return i
              }
            }
            return -1
          }(this._previousClusters, t);
          if (i >= 0) (e = this._previousClusters[i])._impl.resetNodeTransform();
          else {
            var n = function (t) {
              var e = 0,
                i = 0,
                n = 0;
              t.forEach((function (t) {
                e += t.coordinate.latitude;
                var o = s.wrapLongitude(t.coordinate.longitude) / 180 * Math.PI;
                i += Math.cos(o), n += Math.sin(o)
              }));
              var o = t.length,
                r = e / o,
                a = 0 === i ? n < 0 ? -90 : 90 : 180 * Math.atan(n / i) / Math.PI + (i < 0 ? 180 : 0);
              return new s.Coordinate(r, a)
            }(t);
            e = this._annotationsController.addCluster(new o(n, t)), this._previousClusters.push(e)
          }
          return e
        },
        _needsUpdate: function () {
          if (this._zoomLevel !== this._previousZoomLevel || this._rotation !== this._previousRotation) return "region";
          if (this._changesSinceLastCollision) return "annotations";
          var t = this._annotations.length;
          if (this._previousAnnotations.length !== t) return "annotations";
          for (var e = 0; e < t; ++e)
            if (this._annotations[e] !== this._previousAnnotations[e]) return "annotations";
          return ""
        }
      }, t.exports = l
    },
    2281: (t, e, i) => {
      var n = i(9328),
        o = i(4140),
        s = i(1593),
        r = i(2114),
        a = i(7758),
        l = i(7764),
        h = i(5156);

      function c(t) {
        this._realAnnotation = t
      }

      function d(t) {
        n.BaseNode.call(this), this._realAnnotation = t, this.annotation = new c(t), this._renderer = new l(this);
        var e = 2 * this.params.balloonRadius;
        this.size = new o(e, this.params.height + this.params.offset), this.layerBounds = new s(0, 0, this.size.width, this.size.height), this._renderer.isFallbackGlyphTextPending && this._renderer.addPendingNode(this), this.needsDisplay = !0
      }
      c.prototype = {
        constructor: c,
        glyphText: "",
        get glyphColor() {
          var t = this._realAnnotation.map;
          return t ? h.DefaultGlyphColor[t.colorScheme] : h.DefaultGlyphColor.light
        },
        isGlyphImagePOIIcon: !1,
        get color() {
          var t = this._realAnnotation.map;
          return t ? h.DefaultColor[t.colorScheme] : h.DefaultColor.light
        },
        useSquareBalloon: !1
      }, d.prototype = r.inheritPrototype(n.BaseNode, d, {
        enablesDefaultGlyphImage: !0,
        get position() {
          return this._realAnnotation.nodePosition()
        },
        frozen: !0,
        state: "default",
        params: a.Params.default,
        stringInfo: function () {
          return "ImageAnnotationFallbackNode"
        },
        injectDefaultImage: function (t, e) {
          this.injectedDefaultImage = t, this.injectedDefaultImageScale = e
        },
        freeze: function () { }
      }), t.exports = d
    },
    559: (t, e, i) => {
      var n, o = i(4782),
        s = i(3658),
        r = i(2114),
        a = i(4140),
        l = i(210),
        h = i(311),
        c = i(6246);

      function d(t, e) {
        var i;
        if ("function" != typeof t.getImageUrl) return (i = function (t) {
          if (t && "object" == typeof t) {
            for (var e, i = Object.keys(t).filter((function (e) {
              return !!t[e]
            })).map(parseFloat).filter((function (t) {
              return !isNaN(t)
            })).sort(), n = s.devicePixelRatio, o = i.length - 1; o >= 0 && ((!e || i[o] >= n) && (e = i[o]), !(i[o] <= n)); --o);
            return e
          }
        }(t)) ? void e({
          ratio: i,
          glyphImageUrl: t[i]
        }) : void e();
        i = s.devicePixelRatio, c(t.getImageUrl, t, [i, function (t) {
          setTimeout(e.bind(null, t ? {
            ratio: i,
            glyphImageUrl: t
          } : void 0))
        }])
      }

      function u(t) {
        function e(e, i, n) {
          if (this._sceneGraphNode = new o(this), t.call(this, e, i, t.div, n), !n || !("url" in n)) throw new Error("[MapKit] No URL for image of ImageAnnotation");
          this._waitingForImageSize = !this._userSetSize, this._setSceneGraphNode(), this.url = n.url
        }
        return e.prototype = r.inheritPrototype(t, e, {
          renderedByDOMElement: !1,
          get url() {
            return this._url
          },
          set url(t) {
            this._pendingGlyphImage = t, d(t, function (e) {
              if (this._pendingGlyphImage === t) {
                if (delete this._pendingGlyphImage, !e) throw new Error("[MapKit] No URL for image of ImageAnnotation");
                var i = e.ratio,
                  n = e.glyphImageUrl;
                this._ratio = i, this._url = t, this._setSceneGraphNode(), this._removeImageEventListener(), (this._sceneGraphNode.image = s.htmlElement("img", {
                  src: n
                })).complete ? this.updateSize() : (this._userSetSize || (this._waitingForImageSize = !0), this._addImageEventListener())
              }
            }.bind(this)), this._url = t
          },
          positionForCallout: function () {
            if (this._sceneGraphNode instanceof o) return t.prototype.positionForCallout.call(this);
            var e = this._node.size,
              i = new l(-e.width / 2, 0),
              n = this.nodePosition(),
              s = new l(0, 1);
            return new l(n.x - i.x - s.x, n.y - i.y - s.y)
          },
          calculateNodePosition: function () {
            return this._sceneGraphNode instanceof o ? t.prototype.calculateNodePosition.call(this) : new l(this._position.x - this._anchorPoint.x, this._position.y - this._anchorPoint.y)
          },
          handleEvent: function (e) {
            switch (e.type) {
              case "load":
                0, this._removeImageEventListener(), this._handleImageLoaded();
                break;
              case "error":
                0, this._removeImageEventListener(), this._handleImageError();
                break;
              default:
                return void t.prototype.handleEvent.call(this, e)
            }
          },
          resetNodeTransform: function () {
            this.sceneGraphNode.transform = new h
          },
          updateSize: function () {
            if (this._waitingForImageSize = !1, this._sceneGraphNode instanceof o) {
              var e;
              if (this._userSetSize) e = this._node.size;
              else {
                var i = this._sceneGraphNode.image;
                e = new a(i.naturalWidth / this._ratio, i.naturalHeight / this._ratio), this.setSize(e)
              }
              this._sceneGraphNode.size = e
            } else e = this._sceneGraphNode.size, this._userSetSize && console.warn("[MapKit] Size set on the ImageAnnotation is removed."), this.setSize(e), this._userSetSize = !1;
            this._setElementSize(e), t.prototype.updateSize.call(this)
          },
          isAKnownOption: function (e) {
            return "url" === e || t.prototype.isAKnownOption.call(this, e)
          },
          willMoveToMap: function () {
            this._isMoving = this.doesAnimate()
          },
          canShowCallout: function () {
            return !this._waitingForImageSize && t.prototype.canShowCallout.call(this)
          },
          _addImageEventListener: function () {
            this._sceneGraphNode.image.addEventListener("load", this), this._sceneGraphNode.image.addEventListener("error", this)
          },
          _removeImageEventListener: function () {
            this._sceneGraphNode.image && (this._sceneGraphNode.image.removeEventListener("load", this), this._sceneGraphNode.image.removeEventListener("error", this))
          },
          _handleImageLoaded: function () {
            this.updateSize()
          },
          _handleImageError: function () {
            this._sceneGraphNode.image && console.error("[MapKit] Could not load image for ImageAnnotation at URL " + this._sceneGraphNode.image.src), this._setSceneGraphNodeToFallback(), this.updatePosition(), this.updateSize()
          },
          _setElementSize: function (t) {
            this._element.style.width = t.width + "px", this._element.style.height = t.height + "px"
          },
          _setSceneGraphNode: function () {
            if (!(this._sceneGraphNode instanceof o)) {
              var t = this._sceneGraphNode;
              this._sceneGraphNode = new o(this), t.parent && t.parent.replaceChild(this._sceneGraphNode, t)
            }
          },
          _setSceneGraphNodeToFallback: function () {
            if (n || (n = i(2281)), !(this._sceneGraphNode instanceof n)) {
              this._removeImageEventListener();
              var t = this._sceneGraphNode;
              this._sceneGraphNode = new n(this), t.injectedDefaultImage && t.injectedDefaultImageScale && this._sceneGraphNode.injectDefaultImage(t.injectedDefaultImage, t.injectedDefaultImageScale), t.parent && t.parent.replaceChild(this._sceneGraphNode, t)
            }
          }
        }), e
      }
      u.getImageDelegateBestUrl = d, t.exports = u
    },
    3766: (t, e, i) => {
      var n = i(5077),
        o = i(559)(n);
      t.exports = o
    },
    4782: (t, e, i) => {
      var n = i(9328),
        o = i(2114);

      function s(t) {
        n.ImageNode.call(this), this._annotation = t
      }
      s.prototype = o.inheritPrototype(n.ImageNode, s, {
        get position() {
          return this._annotation.nodePosition()
        },
        injectDefaultImage: function (t, e) {
          this.injectedDefaultImage = t, this.injectedDefaultImageScale = e
        }
      }), t.exports = s
    },
    7199: (t, e, i) => {
      var n = i(6074),
        o = i(1636),
        s = i(2114);

      function r(t, e) {
        if (o(this, r)) {
          var n = i(3766);
          Object.defineProperty(this, "_impl", {
            value: new n(this, t, e)
          })
        }
      }
      i(559), r.prototype = s.inheritPrototype(n, r, {
        get url() {
          return this._impl._url
        },
        set url(t) {
          this._impl.url = t
        }
      }), t.exports = r
    },
    8522: (t, e, i) => {
      var n = i(4157),
        o = i(6246);

      function s(t) {
        this._annotationsController = t
      }
      s.prototype = {
        mapFeatureDidSelect: function (t) {
          var e = this._annotationsController.map,
            i = n.fromMapFeatureRegion(t),
            s = e.annotationForMapFeature;
          "function" == typeof s && (i = o(s, e.public, [i]) || i), i._impl.selected = !0, this._annotationsController.addItem(i, 0), i._impl.isMapFeature = !0
        },
        mapTypeDidChange: function () {
          var t = this._annotationsController.selectedItem;
          t && t._impl.isMapFeature && this._annotationsController.items.indexOf(t) >= 0 && this._annotationsController.removeItem(t)
        },
        annotationSelectionDidChange: function (t) {
          !t.selected && t._impl.isMapFeature && this._annotationsController.items.indexOf(t) >= 0 && this._annotationsController.removeItem(t)
        }
      }, t.exports = s
    },
    2750: (t, e, i) => {
      var n = i(3032);

      function o(t, e, i) {
        this.annotation = t, this._url = e.replace("{{size}}", i.toString())
      }
      o.prototype.getImageUrl = function (t, e) {
        var i;
        this.annotation.map ? i = this.annotation.map.colorScheme : (console.warn("[MapKit] Returning the URL of light color scheme GlyphImage."), i = "light"), t = Math.ceil(Math.min(Math.max(t, 1), 3)), e(this._url.replace("{{accessKey}}", encodeURIComponent(n.accessKey)).replace("{{scale}}", t).replace("{{tint}}", i))
      }, t.exports = o
    },
    1215: (t, e, i) => {
      var n = i(8877),
        o = i(3658),
        s = i(3032),
        r = i(6246);

      function a(t) {
        this._impl = t
      }
      var l = function () {
        throw new Error("[MapKit] `MapFeatureAnnotationGlyphImage` may not be constructed directly.")
      };
      a.prototype = l.prototype = {
        constructor: l,
        getImageUrl: function (t, e) {
          if (("number" != typeof t || isNaN(t)) && (t = o.devicePixelRatio), "function" != typeof e) throw new Error("[MapKit] Expects a callback to be provided.");
          HTMLCanvasElement.prototype.toBlob ? this._impl.getImageUrl(t, (function (t) {
            var i = new n.ImageLoader(n.Priority.Highest, {
              urlForImageLoader: t,
              loaderDidSucceed: function (t) {
                var i = t.image,
                  n = document.createElement("canvas");
                n.width = i.naturalWidth, n.height = i.naturalHeight, n.getContext("2d").drawImage(i, 0, 0), n.toBlob((function (t) {
                  r(e, null, [URL.createObjectURL(t)])
                }))
              },
              loaderDidFail: function (t) {
                setTimeout((function () {
                  r(e, null)
                }))
              }
            });
            i.crossOrigin = o.getCorsAttribute(s.withCredentials), i.schedule()
          })) : setTimeout((function () {
            r(e, null)
          }))
        }
      }, t.exports = a
    },
    5163: (t, e, i) => {
      var n = i(3745),
        o = i(9536),
        s = i(2114);

      function r(t, e, i) {
        o.call(this, t, e, i)
      }
      r.prototype = s.inheritPrototype(o, r, {
        styleAttributes: "",
        featureType: "",
        pointOfInterestCategory: null,
        get isGlyphImagePOIIcon() {
          return !0
        },
        get color() {
          return this.map ? this.colors[this.map.colorScheme] : this.colors.light
        },
        get colors() {
          return this._colors ? this._colors : o.DefaultColor
        },
        set colors(t) {
          this._colors = t
        },
        muid: void 0,
        fetchPlace: function (t) {
          return s.required(t, "[MapKit] Missing `callback` in call to `MapFeatureAnnotation.fetch()`.").checkType(t, "function", "[MapKit] `callback` passed to `MapFeatureAnnotation.fetch()` is not a function."), (new n).fetch(this.muid, t)
        },
        isGlyphImageInternal: !0,
        loadGlyphImage: function (t, e, i, n) {
          this.map && o.prototype.loadGlyphImage.call(this, t, e, i, n)
        },
        updateLayout: function (t) {
          this.updateGlyphImages(), o.prototype.updateLayout.call(this, t)
        },
        addedToMap: function () {
          o.prototype.addedToMap.call(this), this.updateGlyphImages()
        }
      }), t.exports = r
    },
    4157: (t, e, i) => {
      var n = i(9601),
        o = i(3032),
        s = i(9389),
        r = i(4935),
        a = i(2114),
        l = i(1215),
        h = i(2750);

      function c(t, e) {
        var n = i(5163);
        Object.defineProperty(this, "_impl", {
          value: new n(this, t, e)
        })
      }
      var d = function () {
        throw new TypeError("[MapKit] MapFeatureAnnotation may not be constructed.")
      };
      c.prototype = d.prototype = a.inheritPrototype(s, d, {
        get featureType() {
          return this._impl.featureType
        },
        fetchPlace: function (t) {
          return this._impl.fetchPlace(t)
        },
        get pointOfInterestCategory() {
          return this._impl.pointOfInterestCategory
        },
        get map() {
          return this._impl.map
        },
        get element() {
          return this._impl.element
        },
        get coordinate() {
          return this._impl.coordinate
        },
        get title() {
          return this._impl.title
        },
        get subtitle() {
          return this._impl.subtitle
        },
        get accessibilityLabel() {
          return this._impl.accessibilityLabel
        },
        get enabled() {
          return this._impl.enabled
        },
        get calloutEnabled() {
          return this._impl.calloutEnabled
        },
        get anchorOffset() {
          return this._impl.anchorOffset
        },
        get animates() {
          return this._impl.animates
        },
        get appearanceAnimation() {
          return this._impl.appearanceAnimation
        },
        get calloutOffset() {
          return this._impl.calloutOffset
        },
        get callout() {
          return this._impl.callout
        },
        get draggable() {
          return this._impl.draggable
        },
        get padding() {
          return this._impl.padding
        },
        get collisionMode() {
          return this._impl.collisionMode
        },
        get size() {
          return this._impl.size
        },
        get color() {
          return this._impl.color
        },
        get glyphColor() {
          return this._impl.glyphColor
        },
        get glyphImage() {
          return this._impl.glyphImage ? (this._impl._glyphImagePublic || (this._impl._glyphImagePublic = new l(this._impl.glyphImage)), this._impl._glyphImagePublic) : null
        },
        get selectedGlyphImage() {
          return this._impl.selectedGlyphImage ? (this._impl._selectedGlyphImagePublic || (this._impl._selectedGlyphImagePublic = new l(this._impl.selectedGlyphImage)), this._impl._selectedGlyphImagePublic) : null
        },
        get glyphText() {
          return this._impl.glyphText
        },
        get titleVisibility() {
          return this._impl.titleVisibility
        },
        get subtitleVisibility() {
          return this._impl.subtitleVisibility
        }
      }), c.fromMapFeatureRegion = function (t) {
        var e = new c(new n.MapPoint(t.position[0], t.position[1]).toCoordinate(), {
          selected: !0,
          title: "(title here)"
        });
        switch (e._impl.muid = t.muid, e._impl.styleAttributes = t.styleAttributes, t.featureType) {
          case "poi":
            e._impl.featureType = r.PointOfInterest;
            break;
          case "territory":
            e._impl.featureType = r.Territory
        }
        if ("poi" === t.featureType && t.calloutGlyphImageUrlTemplate) {
          e._impl.colors = {
            light: "rebeccapurple",
            dark: "mediumvioletred"
          };
          var i = function (t) {
            for (var e = 0, i = t.length; i--;) e += t.charCodeAt(i);
            return e
          }(t.styleAttributes),
            s = o.madabaDomains[i % o.madabaDomains.length] + t.calloutGlyphImageUrlTemplate;
          o.proxyPrefixes && (s = o.proxyPrefixes[0] + s), e._impl.glyphImage = new h(e, s, 3), e._impl.selectedGlyphImage = new h(e, s, 4), e._impl.enablesDefaultGlyphImage = !1
        }
        return e
      }, t.exports = c
    },
    770: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = i(1593),
        r = i(7764),
        a = i(5432),
        l = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);

      function h(t, e) {
        n.BaseNode.call(this), this.annotation = t, e && (this._state = e)
      }
      h.prototype = o.inheritPrototype(n.BaseNode, h, {
        delegate: null,
        enablesDefaultGlyphImage: !0,
        setDelegate: function (t) {
          this.delegate = t
        },
        stringInfo: function () {
          var t = this._renderer.rendererForSharedLayer,
            e = l(this, "_state") ? "<" + this.state + ">" : "",
            i = l(t, "glyphFontSize") ? ' "' + this.annotation.glyphText + '"@' + t.glyphFontSize : "",
            n = this._renderer instanceof a ? " ⏹" : "",
            o = t.glyphImageSrc ? (this.annotation.isGlyphImagePOIIcon ? " 🏞 " : " 🖼 ") + t.glyphImageSrc : "";
          return "MarkerAnnotationBalloonNode" + e + ("<color: " + this.annotation.color + ">") + i + o + n
        },
        get state() {
          return l(this, "_state") ? this._state : this.delegate.state
        },
        get params() {
          return this.delegate.getParamsFromState(this.state)
        },
        get layerBounds() {
          var t = Math.ceil(this.size.width / 2),
            e = Math.ceil(this.size.height / 4);
          return new s(-t, -e, this.size.width + 2 * t, Math.ceil(1.5 * this.size.height) + e)
        },
        glyphImageError: function (t) {
          "selected" === t && this.selectedGlyphImage ? delete this.selectedGlyphImage : delete this.glyphImage, this.needsDisplay = !0
        },
        setBalloonStyle: function () {
          this.annotation.useSquareBalloon ? this._renderer = new a(this) : this._renderer = new r(this)
        },
        freeze: function () {
          if ("default" === this.state || "lifted" === this.state) {
            var t = this.annotation;
            if (!t.glyph && this._renderer.isFallbackGlyphTextPending && this._renderer.addPendingNode(this), this.keyForFrozenLayer = "balloon-" + [t.color, t.glyph ? t.glyph : this._renderer.fallbackGlyphText, t.glyphColor, t.useSquareBalloon ? "square" : ""].join("-"), this.annotation.isGlyphImagePOIIcon) {
              var e = this.annotation.map ? this.annotation.map._impl.mapNodeTint : "light";
              this.keyForFrozenLayer += ["poi", e].join("-")
            }
          } else this.keyForFrozenLayer = ""
        }
      }), t.exports = h
    },
    7764: (t, e, i) => {
      var n = i(713),
        o = i(2114);

      function s(t) {
        n.call(this, t)
      }
      s.prototype = o.inheritPrototype(n, s, {
        drawDotUnderCallout: function (t, e, i) {
          t.strokeStyle = e, t.lineWidth = i, t.arc(i, i, i / 2, 0, 2 * Math.PI), t.stroke()
        },
        pathForBalloon: function (t, e, i) {
          switch (i) {
            case "balloon":
              t.save(), t.scale(e / 256, e / 256), t.moveTo(327.439, 501.776), t.lineTo(327.525, 501.776), t.bezierCurveTo(301.142, 509.276, 279.265, 526.476, 266.881, 550.341), t.bezierCurveTo(263.709, 556.456, 261.65, 562.811, 255.956, 562.811), t.bezierCurveTo(250.262, 562.811, 248.204, 556.456, 245.03, 550.341), t.bezierCurveTo(232.648, 526.471, 210.771, 509.272, 184.388, 501.776), t.lineTo(184.561, 501.776), t.bezierCurveTo(77.943, 470.858, 0, 372.507, 0, 255.944), t.bezierCurveTo(0, 114.59, 114.615, 0, 256, 0), t.bezierCurveTo(397.385, 0, 512, 114.59, 512, 255.944), t.bezierCurveTo(512, 372.507, 434.057, 470.858, 327.439, 501.775), t.closePath(), t.restore();
              break;
            case "default":
              var n = e / 13.5 * 5,
                o = n / 6,
                s = n / 3,
                r = 2 * e,
                a = .448 * e,
                l = .385 * e;
              t.moveTo(r, e), t.bezierCurveTo(r, 1.5 * e, r - l, r - n / 3, e + n / 2 + s, r), t.bezierCurveTo(e + n / 3, r + n / 3, e + o, r + n, e, r + n), t.bezierCurveTo(e - o, r + n, e - n / 3, r + n / 3, e - (n / 2 + s), r), t.bezierCurveTo(l, r - n / 3, 0, 1.5 * e, 0, e), t.bezierCurveTo(0, a, a, 0, e, 0), t.bezierCurveTo(r - a, 0, r, a, r, e), t.closePath();
              break;
            default:
              t.arc(e, e, e, 0, 2 * Math.PI)
          }
        },
        pathForMask: function (t, e, i) {
          t.arc(e, e, i, 0, 2 * Math.PI)
        }
      }), t.exports = s
    },
    713: (t, e, i) => {
      var n, o = i(975),
        s = i(5185),
        r = i(2114),
        a = i(8877),
        l = i(3658),
        h = i(3032),
        c = i(2640),
        d = ["default", "selected", "bubble"],
        u = [],
        p = " ",
        m = "default-loading";

      function g(t) {
        s.call(this, t)
      }

      function _(t, e, i) {
        i = i || 1, t.shadowBlur = 10 * i, t.shadowColor = "rgba(0, 0, 0, .5)", t.shadowOffsetY = e * i * .1, t.globalCompositeOperation = "overlay"
      }

      function f(t, e, i, n) {
        null == n && (n = e.glyphText);
        var r = e.isGlyphImagePOIIcon && !s.shouldRenderFlatBalloon();
        t.save(), t.textBaseline = "bottom", t.fillStyle = e.glyphColor;
        var a, l = i.glyphFontSize;
        do {
          t.font = l-- + "px " + o.MarkerAnnotationFontFamily, a = t.measureText(n).width
        } while (a > i.glyphImageSize && l > 0);
        var h, c = i.balloonRadius + l / 2 + 1;
        return g.needsLowerBaseline && (c += 1), "1" === n ? (t.textAlign = "left", h = i.balloonRadius - a / 2 - t.measureText(n).width / 16, r && (t.save(), _(t, i.glyphImageSize), t.fillText(n, h, c, i.glyphImageSize), t.restore()), t.fillText(n, h, c, i.glyphImageSize)) : g.needsExtraRenderingWorkaround && "2" === n && 13.5 === i.balloonRadius ? (t.textAlign = "left", h = i.balloonRadius - a / 2 - .2, r && (t.save(), _(t, i.glyphImageSize), t.fillText(n, h, c, i.glyphImageSize), t.restore()), t.fillText(n, h, c, i.glyphImageSize)) : (t.textAlign = "center", r && (t.save(), _(t, i.glyphImageSize), t.fillText(n, i.balloonRadius, c, i.glyphImageSize), t.restore()), t.fillText(n, i.balloonRadius, c, i.glyphImageSize)), t.restore(), l + 1
      }

      function y() {
        var t = Math.min(l.devicePixelRatio, 3),
          e = c.createImageUrl("pins/marker"),
          i = (t > 1 ? "_" + t + "x" : "") + ".png",
          o = {},
          s = d.length;

        function r() {
          0 === --s && ((n = o).lifted = n.default, p = "", m = "default", u.forEach((function (t) {
            t.freeze(), t.needsDisplay = !0
          })), u = void 0)
        }
        d.forEach((function (t) {
          o[t] = {},
            function (t) {
              var n = new a.ImageLoader(a.Priority.Highest, {
                urlForImageLoader: e + (t ? "-" : "") + t + i,
                loaderDidSucceed: function () {
                  o[t] = n.image, r()
                },
                loaderDidFail: function () {
                  console.warn("[MapKit] Error loading marker annotation image " + n.url + "; marker annotations may not display correctly."), p = "?", m = "default-error", r()
                }
              });
              n.crossOrigin = l.getCorsAttribute(h.distUrlWithCredentials), n.schedule()
            }(t)
        }))
      }
      g.loadMarkerResources = function () {
        w()
      }, g.needsLowerBaseline = !1, g.needsExtraRenderingWorkaround = !1, g.prototype = r.inheritPrototype(s, g, {
        draw: function (t) {
          this._sharedLayer && (this._sharedLayer.renderer = this);
          var e = this._node,
            i = e.state,
            o = e.annotation,
            r = e.params;
          delete this.glyphImageSrc, delete this.renderType, t.save(), "bubble" !== r.style && (t.shadowOffsetY = r.shadowOffsetY * r.balloonRadius, t.shadowBlur = r.shadowBlur, t.shadowColor = r.shadowColor);
          var a = o.isGlyphImagePOIIcon && !s.shouldRenderFlatBalloon();
          var h = "poi" === r.style;
          if (t.beginPath(), "callout" === i) this.drawDotUnderCallout(t, o.color, r.radius);
          else {
            if (this.pathForBalloon(t, r.balloonRadius, r.style), t.fillStyle = h ? o.darkColorScheme ? "black" : "white" : o.color, t.fill(), t.save(), h) {
              t.beginPath();
              var c = r.balloonRadius - r.borderWidth;
              this.pathForMask(t, r.balloonRadius, c), t.fillStyle = o.color, t.fill()
            }
            if (a) {
              t.clip(), t.globalCompositeOperation = "overlay", t.beginPath();
              var d = r.balloonRadius;
              t.moveTo(-d, -d), t.lineTo(-d, r.height + d), t.lineTo(2 * r.balloonRadius + d, r.height + d), t.lineTo(2 * r.balloonRadius + d, -d), t.lineTo(-d, -d);
              var u = t.createLinearGradient(r.balloonRadius, 0, r.balloonRadius, r.height);
              u.addColorStop(0, "#a5a5a5"), u.addColorStop(.9, "#4d4d4d"), t.fillStyle = u, t.fill(), this.pathForBalloon(t, r.balloonRadius, r.style), t.fillStyle = o.color, t.shadowBlur = .8 * r.balloonRadius, t.shadowOffsetY = .2 * -r.balloonRadius, t.shadowColor = "rgba(0, 0, 0, .07)", t.fill(), t.fillStyle = o.color, t.shadowBlur = 1.1 * r.balloonRadius, t.shadowOffsetY = .4 * -r.balloonRadius, t.shadowColor = "rgba(0, 0, 0, .35)", t.fill()
            }
            t.restore()
          }
          t.restore(), "callout" !== i && (delete this.glyphFontSize, o.glyphText ? (this.glyphFontSize = f(t, o, r), this.renderType = "glyphText") : (this.glyphImageSrc = function (t, e, i, o, s, r) {
            var a, h, c = s ? 2 * o.balloonRadius : o.glyphImageSize,
              d = l.roundToDevicePixel((e.size.width - c) / 2),
              u = !1;
            a = "default" === i || "lifted" === i ? e.glyphImage : e.selectedGlyphImage || e.glyphImage;
            !a && e.injectedDefaultImage && (a = e.injectedDefaultImage, h = e.injectedDefaultImageScale, c = o.glyphImageSize, d = l.roundToDevicePixel((e.size.width - c) / 2, h), s = !1, u = !0);
            if (!a && e.enablesDefaultGlyphImage) {
              if (p) return w(), f(t, e.annotation, o, p), null;
              a = n["bubble" === e.params.style ? "bubble" : i], c = o.glyphImageSize, d = l.roundToDevicePixel((e.size.width - c) / 2), s = !1, u = !0
            }
            try {
              var m;
              return h ? (m = s ? b(a, e.annotation.color, c * h, 2 * (o.balloonRadius - o.borderWidth) * h, r) : C(a, e.annotation.glyphColor, c * h), t.save(), t.scale(1 / h, 1 / h), t.save(), _(t, o.glyphImageSize, h), t.drawImage(m, d * h, d * h, c * h, c * h), t.restore(), t.drawImage(m, d * h, d * h, c * h, c * h), t.restore()) : (m = s ? b(a, e.annotation.color, c, 2 * (o.balloonRadius - o.borderWidth), r) : C(a, e.annotation.glyphColor, c), t.save(), _(t, o.glyphImageSize), t.drawImage(m, d, d, c, c), t.restore(), t.drawImage(m, d, d, c, c)), u ? null : a.src
            } catch (t) {
              e.glyphImageError()
            }
          }(t, e, i, r, o.isGlyphImagePOIIcon, this.pathForMask.bind(this)), this.renderType = this.glyphImageSrc ? "glyphImage" : m))
        },
        get isFallbackGlyphTextPending() {
          return !n
        },
        addPendingNode: function (t) {
          u.indexOf(t) < 0 && u.push(t)
        },
        get fallbackGlyphText() {
          return p
        },
        get rendererForSharedLayer() {
          return this._sharedLayer ? this._sharedLayer.renderer : this
        },
        drawDotUnderCallout: function () {
          0
        },
        pathForBalloon: function () {
          0
        },
        pathForMask: function () {
          0
        }
      });
      var v = !1;

      function w() {
        v || (v = !0, h.state !== h.States.PENDING && h.state !== h.States.READY ? h.addEventListener(h.Events.Initialized, (function t() {
          h.removeEventListener(h.Events.Initialized, t), y()
        })) : y())
      }

      function b(t, e, i, n, o) {
        t._maskedPOIImage || (t._maskedPOIImage = []);
        var s = l.devicePixelRatio,
          a = i * s;
        if (!t._maskedPOIImage[a]) {
          var h = n * s / 2,
            c = r.createCanvas();
          c.width = a, c.height = a;
          var d = c.getContext("2d");
          d.beginPath(), o(d, a / 2, h), d.clip(), d.drawImage(t, 0, 0, a, a), t._maskedPOIImage[a] = c
        }
        return t._maskedPOIImage[a]
      }

      function C(t, e, i) {
        t._tinted || (t._tinted = {}), t._tinted[e] || (t._tinted[e] = []);
        var n = i * l.devicePixelRatio;
        if (!t._tinted[e][n]) {
          var o = r.createCanvas();
          o.width = n, o.height = n;
          var s = o.getContext("2d");
          s.fillStyle = e, s.fillRect(0, 0, n, n), s.globalCompositeOperation = "destination-in", s.drawImage(t, 0, 0, n, n), t._tinted[e][n] = o
        }
        return t._tinted[e][n]
      }
      window.document || (n = {}), t.exports = g
    },
    5830: (t, e, i) => {
      var n = i(5185),
        o = i(2114);

      function s(t) {
        n.call(this, t)
      }
      s.prototype = o.inheritPrototype(n, s, {
        draw: function (t) {
          var e = this._node;
          t.save(), t.beginPath(), this.pathForDot(t, e.radius), t.fillStyle = e.annotation.color, t.fill(), e.annotation.isGlyphImagePOIIcon && !n.shouldRenderFlatBalloon() && (t.globalCompositeOperation = "overlay", t.fillStyle = "#4d4d4d", t.fill(), t.fillStyle = "rgba(0, 0, 0, .07)", t.fill(), t.fillStyle = "rgba(0, 0, 0, .35)", t.fill()), t.restore()
        },
        pathForDot: function () {
          0
        }
      }), t.exports = s
    },
    5185: (t, e, i) => {
      var n, o = i(9328),
        s = i(2114);

      function r(t) {
        o.RenderItem.call(this, t)
      }
      r.prototype = s.inheritPrototype(o.RenderItem, r, {
        pathForSquareDot: function (t, e) {
          var i = .6 * e,
            n = .4 * e;
          t.moveTo(e, 0), t.lineTo(e + n, 0), t.arc(e + n, i, i, Math.PI / 2 * 3, 0), t.lineTo(2 * e, e + n), t.arc(e + n, e + n, i, 0, Math.PI / 2), t.lineTo(i, 2 * e), t.arc(i, e + n, i, Math.PI / 2, Math.PI), t.lineTo(0, e - n), t.arc(i, i, i, Math.PI, Math.PI / 2 * 3), t.lineTo(e, 0)
        }
      }), r.shouldRenderFlatBalloon = function () {
        if (void 0 !== n) return n;
        if (s.isNode()) return n = !1;
        var t = s.createCanvas().getContext("2d");
        return t.globalCompositeOperation = "overlay", n = "overlay" !== t.globalCompositeOperation
      }, t.exports = r
    },
    7132: (t, e, i) => {
      var n = i(7236),
        o = i(7764),
        s = i(5432);

      function r(t, e) {
        t.useSquareBalloon ? this._renderer = new s(this) : this._renderer = new o(this), this.frozen = !0, this.annotation = t, this.state = "selected", this.params = e;
        var i = 2 * e.balloonRadius;
        this.size = new n.Size(i, i), this.layerBounds = new n.Rect(0, 0, this.size.width, this.size.height)
      }
      r.prototype.enablesDefaultGlyphImage = !0, r.prototype.draw = function () {
        !this.annotation.glyph && this._renderer.isFallbackGlyphTextPending && this._renderer.addPendingNode(this);
        var t = this._renderer.layer;
        t.style.width = t.style.height = this.size.width + "px", this._renderer.draw(t.getContext("2d"))
      }, r.prototype.getLayer = function () {
        return this._renderer.layer
      }, r.prototype.glyphImageError = function (t) {
        "selected" === t && this.selectedGlyphImage ? delete this.selectedGlyphImage : delete this.glyphImage
      }, r.prototype.updateGlyphImage = function (t) {
        this.glyphImage = t
      }, r.prototype.updateSelectedGlyphImage = function (t) {
        this.selectedGlyphImage = t
      }, r.prototype.freeze = function () {
        this.draw()
      }, t.exports = r
    },
    7561: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = i(2211),
        r = i(6897);

      function a(t, e) {
        n.BaseNode.call(this), this.annotation = t, this.radius = e, t.useSquareBalloon ? this._renderer = new r(this) : this._renderer = new s(this)
      }
      a.prototype = o.inheritPrototype(n.BaseNode, a, {
        stringInfo: function () {
          var t = this._renderer instanceof r ? " ⏹" : "";
          return "MarkerAnnotationDotNode<color: " + this.annotation.color + ">" + t
        }
      }), t.exports = a
    },
    2211: (t, e, i) => {
      var n = i(5830),
        o = i(2114);

      function s(t) {
        n.call(this, t)
      }
      s.prototype = o.inheritPrototype(n, s, {
        pathForDot: function (t, e) {
          t.arc(e, e, e, 0, 2 * Math.PI)
        }
      }), t.exports = s
    },
    5156: (t, e, i) => {
      var n = i(559),
        o = i(7758),
        s = i(7132),
        r = i(311),
        a = i(2114),
        l = i(8877),
        h = i(1232),
        c = i(210),
        d = i(3658),
        u = i(3032),
        p = ["color", "glyphColor", "glyphImage", "selectedGlyphImage", "glyphText", "titleVisibility", "subtitleVisibility"],
        m = {
          light: "#ff5b40",
          dark: "#e6523b"
        },
        g = {
          light: "white",
          dark: "#e7e6e4"
        },
        _ = {
          light: "white",
          dark: "black"
        },
        f = {
          Default: "default",
          Dot: "dot",
          Large: "large"
        };

      function y(t) {
        function e(e, i, n) {
          this._sceneGraphNode = new o(this), t.call(this, e, i, t.div, n), this._public = e, n && p.forEach((function (t) {
            t in n && (this[t] = n[t])
          }), this), this.updateGlyph(), this.useSquareBalloon = this._glyphImage && this._glyphImage.useSquareBalloon || this._selectedGlyphImage && this._selectedGlyphImage.useSquareBalloon, this._sceneGraphNode._balloon.setBalloonStyle(), this._sceneGraphNode.updateState(this.selected ? this.canShowCallout() ? "callout" : "selected" : "default")
        }
        return e.StaticStyles = f, e.prototype = a.inheritPrototype(t, e, {
          _animates: !0,
          _calloutAnchorPoint: new window.DOMPoint(-o.Params.callout.radius, 1),
          _glyphImage: null,
          _selectedGlyphImage: null,
          _glyphText: "",
          _color: null,
          _glyphColor: null,
          _titleVisibility: o.FeatureVisibility.Adaptive,
          _subtitleVisibility: o.FeatureVisibility.Adaptive,
          shouldHideLabels: !0,
          renderedByDOMElement: !1,
          get size() {
            return this._sceneGraphNode.size.copy()
          },
          set size(t) {
            console.warn("[MapKit] The `size` property of a marker annotation cannot be set.")
          },
          get color() {
            return null !== this._color ? this._color : this.map ? m[this.map.colorScheme] : m.light
          },
          set color(t) {
            null !== t && a.checkType(t, "string", "[MapKit] Expected a string value for MarkerAnnotation.color, but got `" + t + "` instead"), t !== this._color && (this._color = t, this._sceneGraphNode.updateAppearance(!0), this._drawCalloutAccessory())
          },
          get glyphColor() {
            return null !== this._glyphColor ? this._glyphColor : this.map ? this.isGlyphImagePOIIcon ? _[this.map.colorScheme] : g[this.map.colorScheme] : g.light
          },
          set glyphColor(t) {
            null !== t && a.checkType(t, "string", "[MapKit] Expected a string value for MarkerAnnotation.glyphColor, but got `" + t + "` instead"), t !== this._glyphColor && (this._glyphColor = t, this._sceneGraphNode.updateAppearance(!0), this._drawCalloutAccessory())
          },
          get glyphImage() {
            return this._glyphImage
          },
          set glyphImage(t) {
            this._setGlyphImage("_glyphImage", "updateGlyphImage", t)
          },
          get selectedGlyphImage() {
            return this._selectedGlyphImage
          },
          set selectedGlyphImage(t) {
            this._setGlyphImage("_selectedGlyphImage", "updateSelectedGlyphImage", t)
          },
          updateGlyphImages: function () {
            this._setGlyphImage("_glyphImage", "updateGlyphImage", this._glyphImage), this._setGlyphImage("_selectedGlyphImage", "updateSelectedGlyphImage", this._selectedGlyphImage)
          },
          get glyphText() {
            return this._glyphText
          },
          set glyphText(t) {
            a.checkType(t, "string", "[MapKit] Expected a string value for MarkerAnnotation.glyphText, but got `" + t + "` instead"), t !== this._glyphText && (this._glyphText = t, this.updateLocalizedText(), this.updateGlyph(), this._sceneGraphNode.updateGlyphText(), this._drawCalloutAccessory())
          },
          get glyph() {
            return this._glyph
          },
          get titleVisibility() {
            return this._titleVisibility
          },
          set titleVisibility(t) {
            if (!a.checkValueIsInEnum(t, o.FeatureVisibility)) throw new Error("[MapKit] Expected one of Hidden, Visible or Adaptive for MarkerAnnotation.titleVisibility");
            t !== this._titleVisibility && (this._titleVisibility = t, this._sceneGraphNode.needsLayout = !0)
          },
          get subtitleVisibility() {
            return this._subtitleVisibility
          },
          set subtitleVisibility(t) {
            if (!a.checkValueIsInEnum(t, o.FeatureVisibility)) throw new Error("[MapKit] Expected one of Hidden, Visible or Adaptive for MarkerAnnotation.subtitleVisibility");
            t !== this._subtitleVisibility && (this._subtitleVisibility = t, this._sceneGraphNode.needsLayout = !0)
          },
          labelsCanBeShown: function () {
            return this.delegate && this.delegate.supportsLabelRegions()
          },
          titleCanBeShown: function () {
            return this.title && this._titleVisibility !== o.FeatureVisibility.Hidden
          },
          subtitleCanBeShown: function (t) {
            return this.subtitle && (this._subtitleVisibility === o.FeatureVisibility.Visible || this._subtitleVisibility === o.FeatureVisibility.Adaptive && (this._public.memberAnnotations || this.selected && t))
          },
          updateLayout: function (t) {
            t ? this._sceneGraphNode.updateLayout() : this._sceneGraphNode.needsLayout = !0
          },
          updatedLayout: function () {
            this._updatedProperty("")
          },
          calculateNodePosition: function () {
            return new c(d.roundToDevicePixel(this._position.x - this._anchorPoint.x - this._anchorOffset.x), this._position.y - this._anchorPoint.y - this._anchorOffset.y)
          },
          get darkColorScheme() {
            return !!this.map && d.darkColorScheme(this.map._impl.mapNodeTint)
          },
          get isGlyphImagePOIIcon() {
            return !!(this._glyphImage && this._glyphImage.isPOIIcon || this._selectedGlyphImage && this._selectedGlyphImage.isPOIIcon)
          },
          isGlyphImageInternal: !1,
          get enablesDefaultGlyphImage() {
            return this._sceneGraphNode.enablesDefaultGlyphImage
          },
          set enablesDefaultGlyphImage(t) {
            this._sceneGraphNode.enablesDefaultGlyphImage = t
          },
          setDelegate: function (e) {
            t.prototype.setDelegate.call(this, e), this.labelsCanBeShown() && this._updatedProperty("title")
          },
          doesAnimate: function () {
            return this._animates
          },
          willMoveToMap: function (t) {
            this._isMoving = t && this.animates
          },
          didMoveToMap: function () {
            var e = this._isMoving;
            t.prototype.didMoveToMap.call(this), this.delegate && e && this.visible && !this._appearanceAnimation && this._shown ? (this._isAnimating = !0, this._sceneGraphNode.animateAppearance((function (t) {
              t.node.annotation.finishedAnimating()
            }))) : this._sceneGraphNode.preventAnimation()
          },
          lift: function (e) {
            this._sceneGraphNode.updateState("lifted"), t.prototype.lift.call(this, e)
          },
          droppedAfterLift: function () {
            this._sceneGraphNode.updateState("default"), t.prototype.droppedAfterLift.call(this)
          },
          canShowCallout: function () {
            return (!!this.callout || this.delegate && !this.delegate.supportsLabelRegions()) && t.prototype.canShowCallout.call(this)
          },
          calloutWillAppear: function (t) {
            this.isStable() && this._sceneGraphNode.updateState(t ? "callout" : "selected")
          },
          calloutWillDisappear: function () {
            this.selected || (delete this._calloutAccessoryNode, this._sceneGraphNode.updateState("default"))
          },
          canvasForCalloutAccessory: function () {
            if (!this.callout || !(this.callout.calloutElementForAnnotation || this.callout.calloutContentForAnnotation || this.callout.calloutLeftAccessoryForAnnotation || this.callout.calloutRightAccessoryForAnnotation)) return this._calloutAccessoryNode || (this._calloutAccessoryNode = new s(this, o.Params.bubble), this._calloutAccessoryNode.glyphImage = this._sceneGraphNode._balloon.glyphImage, this._calloutAccessoryNode.selectedGlyphImage = this._sceneGraphNode._balloon.selectedGlyphImage, this._calloutAccessoryNode.glyphText = this._glyphText, this._drawCalloutAccessory()), this._calloutAccessoryNode.getLayer();
            delete this._calloutAccessoryNode
          },
          get ignoreCalloutCornerRadiusForLeftAccessory() {
            return !0
          },
          altText: function () {
            return t.prototype.altText.call(this) || h.get("Annotation.Marker.AccessibilityLabel")
          },
          isAKnownOption: function (e) {
            return p.indexOf(e) >= 0 || t.prototype.isAKnownOption.call(this, e)
          },
          resetNodeTransform: function () {
            this.sceneGraphNode.transform = new r
          },
          updateGlyph: function () {
            this._glyph = this.glyphText || (this._glyphImageElement ? this._glyphImageElement.src : "")
          },
          set staticStyle(t) {
            var e;
            switch (t) {
              case f.Dot:
                e = "callout";
                break;
              case f.Large:
                e = "selected";
                break;
              default:
                e = "default"
            }
            this._sceneGraphNode.updateState(e), this._sceneGraphNode._usingStaticStyle = !0
          },
          loadGlyphImage: function (t, e, i, o) {
            n.getImageDelegateBestUrl(o, function (n) {
              if (this[e] === o) return n ? void
                function (t, e, i, n) {
                  var o = i + "Loader";
                  t[o] && t[o].unschedule();
                  t[o] = new l.ImageLoader(l.Priority.Highest, {
                    urlForImageLoader: e,
                    loaderDidSucceed: function (e) {
                      t[o] === e && (delete t[o], t[i] = e.image, t.updateGlyph(), t._sceneGraphNode[n](e.image), t._calloutAccessoryNode && (t._calloutAccessoryNode[n](e.image), t._drawCalloutAccessory()))
                    },
                    loaderDidFail: function (e) {
                      t[o] === e && (delete t[o], delete t[i], t.updateGlyph(), t._sceneGraphNode[n](), t._calloutAccessoryNode && (t._calloutAccessoryNode[n](), t._drawCalloutAccessory()))
                    }
                  }), t.isGlyphImageInternal && (t[o].crossOrigin = d.getCorsAttribute(u.withCredentials));
                  t[o].schedule()
                }(this, n.glyphImageUrl, t, i) : (delete this[t], this._sceneGraphNode.glyphImageError(), void (this._calloutAccessoryNode && this._calloutAccessoryNode.glyphImageError()))
            }.bind(this))
          },
          _setGlyphImage: function (t, e, i) {
            null != i && a.checkType(i, "object", "[MapKit] Expected a hash value or an Image delegate for MarkerAnnotation." + t.replace(/^_/, "") + ", but got `" + i + "` instead"), this[t] = i;
            var n = t + "Element";
            if (!i) return delete this[n], this._sceneGraphNode[e](null), void (this._calloutAccessoryNode && (this._calloutAccessoryNode[e](null), this._drawCalloutAccessory()));
            this.loadGlyphImage(n, t, e, i)
          },
          _updatedProperty: function (e) {
            "title" !== e && "subtitle" !== e || (this._sceneGraphNode.needsLayout = !0), t.prototype._updatedProperty.call(this, e)
          },
          _drawCalloutAccessory: function () {
            this._calloutAccessoryNode && this._calloutAccessoryNode.draw()
          }
        }), e.DefaultColor = m, e
      }
      y.StaticStyles = f, y.DefaultColor = m, y.DefaultGlyphColor = g, t.exports = y
    },
    9536: (t, e, i) => {
      var n = i(5077),
        o = i(5156)(n);
      t.exports = o
    },
    5177: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = i(4018),
        r = i(4140);

      function a(t, e, i, o) {
        n.BaseNode.call(this), this.text = t, this.kind = e, this._renderer = new s(this), this.size = new r(i, this._renderer.params[this.kind].height), this.keyForFrozenLayer = (o ? "dark" : "light") + "-" + e + "#" + this.text
      }
      a.prototype = o.inheritPrototype(n.BaseNode, a, {
        stringInfo: function () {
          return "MarkerAnnotationLabelNode<" + this.kind + '> "' + this.text + '"'
        },
        get lineHeight() {
          return this._renderer.params[this.kind].lineHeight
        }
      }), a.Font = {
        title: s.prototype.params.title.font,
        subtitle: s.prototype.params.subtitle.font
      }, t.exports = a
    },
    4018: (t, e, i) => {
      var n = i(975),
        o = i(9328),
        s = i(2114);

      function r(t) {
        o.RenderItem.call(this, t)
      }
      r.prototype = s.inheritPrototype(o.RenderItem, r, {
        params: {
          haloColor: {
            light: "rgba(255, 255, 255, .8)",
            dark: "black"
          },
          haloSize: 2,
          miterLimit: 2,
          textAlign: "center",
          title: {
            font: "600 11px " + n.MarkerAnnotationFontFamily,
            height: 16,
            lineHeight: 12,
            color: {
              light: "#2b2b2b",
              dark: "#e7e6e4"
            },
            yPadding: 1
          },
          subtitle: {
            font: "500 10px " + n.MarkerAnnotationFontFamily,
            height: 15,
            lineHeight: 12,
            color: {
              light: "#4c4c4c",
              dark: "#e7e6e4"
            },
            yPadding: 1
          }
        },
        draw: function (t) {
          var e = this._node,
            i = e.parent.annotation.darkColorScheme ? "dark" : "light",
            n = this.params[e.kind];
          t.font = n.font, t.textAlign = this.params.textAlign, t.textBaseline = "bottom", t.fillStyle = n.color[i], t.strokeStyle = this.params.haloColor[i], t.lineWidth = this.params.haloSize, t.miterLimit = this.params.miterLimit;
          var o = e.size.width / 2,
            s = e.size.height - n.yPadding;
          t.strokeText(e.text, o, s), t.fillText(e.text, o, s)
        }
      }), t.exports = r
    },
    7758: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = i(3658),
        r = i(4937),
        a = i(210),
        l = i(4140),
        h = i(311),
        c = i(975).FeatureVisibility,
        d = 1e-12,
        u = {
          borderWidth: 0,
          labelOutlineWidth: 2,
          shadowColor: "rgba(0, 0, 0, .15)",
          shadowOffsetY: .5,
          innerShadowColor: "rgba(0, 0, 0, .35)",
          transitionDuration: 500,
          dotAnimationDuration: 100,
          dotScale: 1.5,
          anchorPointOffset: 0
        };
      window.document || (u.transitionDuration = 0);
      for (var p = L(u, {
        balloonRadius: 13.5,
        shadowBlur: 11.25,
        dotRadius: 0,
        glyphFontSize: 15,
        glyphImageSize: 20,
        offset: 0,
        style: "default",
        height: 32
      }), m = 11.5, g = L(u, {
        borderWidth: 1.5,
        balloonRadius: m,
        transitionDuration: window.document ? 250 : 0,
        shadowBlur: 5,
        shadowOffsetY: 0,
        dotRadius: 0,
        glyphFontSize: 15,
        glyphImageSize: 16,
        offset: 0,
        style: "poi",
        height: 23,
        anchorPointOffset: -11.5
      }), _ = [], f = 2; f <= 6; f++) {
        var y = 12 + .5 * f;
        _[f] = L(g, {
          balloonRadius: y,
          height: 2 * y
        })
      }
      var v = L(u, {
        balloonRadius: 30,
        shadowBlur: 25,
        dotRadius: 3,
        glyphFontSize: 32,
        glyphImageSize: 40,
        offset: 8,
        style: "balloon",
        height: 66
      }),
        w = L(u, {
          radius: 4.5,
          shadowOffsetY: 0,
          shadowBlur: 0,
          shadowColor: "transparent"
        }),
        b = L(u, {
          balloonRadius: 20,
          dotRadius: 3,
          glyphFontSize: 28,
          glyphImageSize: 30,
          offset: 0,
          style: "bubble",
          height: 40
        }),
        C = i(770),
        k = i(7561),
        S = i(5177);

      function M(t) {
        n.GroupNode.call(this), this.annotation = t, this._balloon = this.addChild(new C(t)), this._balloon.setDelegate(this)
      }
      M.Params = {
        default: p,
        lifted: p,
        selected: v,
        bubble: b,
        callout: w
      }, M.POIIconParams = L(M.Params, {
        default: g,
        lifted: g
      }), M.prototype = o.inheritPrototype(n.BaseNode, M, {
        get position() {
          return this.annotation ? this.annotation.nodePosition() : new a
        },
        stringInfo: function () {
          return "MarkerAnnotationNode" + ("default" !== this.state ? "<" + this.state + ">" : "")
        },
        get enablesDefaultGlyphImage() {
          return this._balloon.enablesDefaultGlyphImage
        },
        set enablesDefaultGlyphImage(t) {
          this._balloon.enablesDefaultGlyphImage = t
        },
        set needsLayout(t) {
          t && !this._needsLayout && r.scheduleASAP(this), this._needsLayout = t
        },
        get needsLayout() {
          return this._needsLayout
        },
        getParamsFromState: function (t) {
          var e = this.annotation.isGlyphImagePOIIcon,
            i = e ? M.POIIconParams : M.Params;
          return "default" === t && this.annotation.n && e ? _[Math.min(this.annotation.n, 6)] : i[t]
        },
        balloonNodeSize: function (t) {
          t || (t = this.state);
          var e = this.getParamsFromState(t);
          if ("callout" === t) return new l(2 * e.radius, 2 * e.radius);
          var i = 2 * e.balloonRadius;
          return new l(i, e.height + e.offset)
        },
        updateAppearance: function (t) {
          window.document && this._balloon.freeze(), t && (this.needsDisplay = !0)
        },
        updateState: function (t) {
          if (!this._usingStaticStyle) {
            var e = this.annotation;
            this.state !== t && (!e.selected && "selected" !== this.state && "callout" !== this.state || !this.state || this._animateFromState || (this._animateFromState = this.state), this.state = t, e._node.size = this._size = this._balloon.size = this.balloonNodeSize(), this.updateAppearance(), this.needsLayout = !0)
          }
        },
        injectDefaultImage: function (t, e) {
          var i = this._balloon;
          t || (delete i.injectedDefaultImage, delete i.injectedDefaultImageScale), i.injectedDefaultImage = t, i.injectedDefaultImageScale = e
        },
        performScheduledUpdate: function () {
          this.updateLayout(!1)
        },
        updateLayout: function (t) {
          this._needsLayout && (this._layoutSubNodes(t), this._needsLayout = !1)
        },
        updateGlyphText: function () {
          this.updateAppearance(!0), this._balloon.needsDisplay = !0
        },
        updateGlyphImage: function (t) {
          this.updateAppearance(), this._balloon.glyphImage = t, this._balloon.needsDisplay = !0
        },
        updateSelectedGlyphImage: function (t) {
          this._balloon.selectedGlyphImage = t, this._balloon.needsDisplay = !0
        },
        glyphImageError: function () {
          this.updateAppearance(), this._balloon.glyphImageError(this.state)
        },
        animateAppearance: function (t) {
          var e = this.getParamsFromState(this.state);
          if (this.children.forEach(function (t) {
            this.annotation.isGlyphImagePOIIcon || t === this._balloon || T(t, e)
          }.bind(this)), !this.annotation.isGlyphImagePOIIcon || this.annotation.selected) A(this._balloon, e, d, 1, new a(this._balloon.size.width / 2, this._balloon.size.height), void 0, t);
          else {
            var i = new a(this._balloon.size.width / 2, this._balloon.size.height / 2);
            x(this._balloon, e, d, 1, i, t)
          }
        },
        preventAnimation: function () {
          this._animationPrevented = !0, this.needsLayout = !0
        },
        _layoutSubNodes: function (t) {
          if (this.annotation) {
            this.updateAppearance();
            var e = this.children.slice();
            this.children = [this._balloon], this._dot && this.addChild(this._dot);
            var i = this._balloon.size.width,
              o = this.annotation,
              r = this.state,
              c = this.getParamsFromState(this.state),
              p = o.map && !this._animationPrevented;
            delete this._animationPrevented;
            var m = "callout" !== r && "lifted" !== r && !("default" === r && o.selected) && o.labelsCanBeShown(),
              g = m && o.titleCanBeShown();
            g ? this._prevTitle = K.call(this, "title", this._prevTitle) : Z.call(this, "title", "_prevTitle"), m && o.subtitleCanBeShown(g) ? this._prevSubtitle = K.call(this, "subtitle", this._prevSubtitle) : Z.call(this, "subtitle", "_prevSubtitle");
            var _ = this._balloon.size.height;
            if ("callout" === r && o.isGlyphImagePOIIcon) 0 !== this.children.filter((function (t) {
              return t.lineHeight
            })).length && (_ += this.getParamsFromState("default").balloonRadius);
            var f = _,
              y = 0;
            this.children.forEach((function (t) {
              t.position = new a((i - t.size.width) / 2, t.lineHeight ? f : 0), t.lineHeight && (f += t.lineHeight, t.fadingOut || (_ += t.lineHeight, y = t.lineHeight / 2))
            })), o._anchorPoint = new a(i / 2, this._balloon.size.height + c.anchorPointOffset), o._node.size = this.size = new l(i, _ + y), o.updatePosition();
            var w = o._position.x - o._anchorPoint.x - o._anchorOffset.x,
              b = this.position.x;
            if (this.children.forEach((function (t) {
              t.position = new a(s.roundToDevicePixel(w + t.position.x) - b, t.position.y)
            })), "selected" === r ? (this._dot || (this._dot = this.addChild(new k(this.annotation, c.dotRadius * c.dotScale), 1)), this._dot.size = new l(2 * c.dotRadius * c.dotScale, 2 * c.dotRadius * c.dotScale), this._dot.position = new a(this._balloon.position.x + c.balloonRadius - c.dotRadius, this._balloon.size.height - 2 * c.dotRadius), this._dot.transform = (new h).scale(1 / c.dotScale), this._dot.wantsLayerBacking = !0) : this._dot && (this._dot.remove(), delete this._dot), p && this._animateFromState) {
              var M = this.getParamsFromState(this._animateFromState);
              if ("callout" === r || "callout" === this._animateFromState) {
                var I = L(c);
                I.transitionDuration /= 2;
                var R, O = this.addChild(new C(this.annotation, this._animateFromState));
                O.setDelegate(this), O.glyphImage = this._balloon.glyphImage, O.selectedGlyphImage = this._balloon.selectedGlyphImage, O.setBalloonStyle(), O.size = this.balloonNodeSize(O.state), this._balloon.transform = (new h).scale(d), "callout" === r ? (O.position = new a((this.size.width - O.size.width) / 2, this._balloon.size.height / 2 - O.size.height - M.anchorPointOffset + 4.5), R = new a(O.size.width / 2, O.size.height + M.anchorPointOffset), x(O, I, 1, d, R, function () {
                  O.remove();
                  var t = L(c);
                  t.transitionDuration /= 2, x(this._balloon, t, d, 1, new a(this._balloon.size.width / 2, this._balloon.size.height / 2))
                }.bind(this))) : (O.position = new a((this.size.width - O.size.width) / 2, this._balloon.size.height + c.anchorPointOffset - O.size.height / 2 - 4.5), R = new a(O.size.width / 2, O.size.height / 2), this.annotation.isGlyphImagePOIIcon ? x(O, I, 1, d, R, function () {
                  O.remove();
                  var t = new a(this._balloon.size.width / 2, this._balloon.size.height / 2);
                  x(this._balloon, c, d, 1, t)
                }.bind(this)) : x(O, I, 1, d, R, function () {
                  O.remove(), A(this._balloon, c, d, 1, new a(this._balloon.size.width / 2, this._balloon.size.height))
                }.bind(this)))
              } else {
                var P, D, z, N = 0;
                o.isGlyphImagePOIIcon ? (P = M.balloonRadius / c.balloonRadius, N = v.height - v.balloonRadius + v.offset, "selected" === r ? (D = new a(c.balloonRadius, c.balloonRadius + N / (1 - P)), z = new a(this._balloon.size.width / 2, this._balloon.size.height)) : D = new a(c.balloonRadius, c.balloonRadius - N / (1 - P))) : (P = this.balloonNodeSize(this._animateFromState).height / this.balloonNodeSize().height, D = new a(this._balloon.size.width / 2, this._balloon.size.height)), 1 !== P && A(this._balloon, c, P, 1, D, z);
                var F = this._dot;
                F && T(F, {
                  transitionDuration: c.dotAnimationDuration
                });
                var U = 0;
                if (1 !== P && o.isGlyphImagePOIIcon && (U = (P < 1 ? 1 : -1) * this.getParamsFromState("default").balloonRadius), 0 !== U) {
                  var G = new a(0, 0),
                    B = new a(0, U);
                  this.children.forEach((function (t) {
                    t.lineHeight && function (t, e, i, o) {
                      new n.NodeAnimator.Translation({
                        node: t,
                        duration: e.transitionDuration,
                        from: i,
                        to: o,
                        pop: !0
                      }).begin()
                    }(t, c, B, G)
                  }))
                }
              }
              delete this._animateFromState
            }
            t || o.updatedLayout()
          }

          function Z(t, i) {
            e.forEach((function (e) {
              e.kind === t && (this.addChild(e), function (t, e, i) {
                t.fadingOut = !0, new n.NodeAnimator.Opacity({
                  node: t,
                  duration: e.transitionDuration,
                  from: 1,
                  to: 0,
                  done: function () {
                    delete t.fadingOut, t.remove()
                  }
                }).begin()
              }(e, c, this.annotation))
            }), this), delete this[i]
          }

          function K(t, e) {
            var n = S.Font[t],
              s = o[t],
              r = p && !!this.parent && s !== e && (!s || !e),
              a = this.annotation.darkColorScheme;
            return function (t, e) {
              E.font = e;
              var i = t.trim().split(/\s+/),
                n = [];
              for (; i.length > 0;) {
                for (var o = [i.shift()], s = o.join(" ").length; i.length > 0 && s <= 16;) o.push(i.shift()), s = o.join(" ").length;
                s > 16 && o.length > 1 && i.unshift(o.pop()), n.push([o.join(" "), E.measureText(o.join(" ")).width + u.labelOutlineWidth])
              }
              return n
            }(s, n).forEach((function (e) {
              var n = new S(e[0], t, e[1], a);
              i = Math.max(i, e[1]), y = n.lineHeight / 2, this.addChild(n), r && T(n, c)
            }), this), s
          }
        }
      }), M.FeatureVisibility = c;
      var E = o.createCanvas().getContext("2d");

      function L(t, e) {
        var i = Object.create(t);
        for (var n in e) i[n] = e[n];
        return i
      }

      function T(t, e) {
        new n.NodeAnimator.Opacity({
          node: t,
          duration: e.transitionDuration
        }).begin()
      }

      function x(t, e, i, o, s, r) {
        new n.NodeAnimator.Scale({
          node: t,
          duration: e.transitionDuration,
          from: i,
          to: o,
          center: s,
          done: r
        }).begin()
      }

      function A(t, e, i, o, s, r, a) {
        new n.NodeAnimator.Float({
          node: t,
          duration: e.transitionDuration,
          from: i,
          to: o,
          center: s,
          floatCenter: r,
          done: a
        }).begin()
      }
      t.exports = M
    },
    5432: (t, e, i) => {
      var n = i(713),
        o = i(2114);

      function s(t) {
        n.call(this, t)
      }
      s.prototype = o.inheritPrototype(n, s, {
        drawDotUnderCallout: function (t, e, i) {
          t.fillStyle = e, this.pathForSquareDot(t, i), t.fill()
        },
        pathForBalloon: function (t, e, i) {
          t.save(), t.scale(e / 256, e / 256), t.moveTo(424.278, 512.1), "balloon" !== i && "default" !== i || (t.lineTo(363.104, 512.1), t.bezierCurveTo(302.97, 513.623, 278.509, 528.747, 266.778, 551.35), t.bezierCurveTo(263.607, 557.462, 261.548, 563.819, 255.857, 563.819), t.bezierCurveTo(250.167, 563.819, 248.107, 557.462, 244.937, 551.35), t.bezierCurveTo(233.205, 528.747, 208.743, 513.623, 148.61, 512.1)), t.lineTo(87.723, 512.1), t.bezierCurveTo(39.475, 512.099, 0, 472.713, 0, 424.573), t.lineTo(0, 87.525), t.bezierCurveTo(0, 39.387, 39.475, 0, 87.723, 0), t.lineTo(424.278, 0), t.bezierCurveTo(472.525, 0, 512, 39.387, 512, 87.525), t.lineTo(512, 424.573), t.bezierCurveTo(512, 472.713, 472.525, 512.099, 424.278, 512.099), t.closePath(), t.restore()
        },
        pathForMask: function (t, e, i) {
          t.save();
          var n = e - i;
          t.translate(n, n), t.scale(i / 256, i / 256), t.moveTo(424.278, 512.1), t.lineTo(87.723, 512.1), t.bezierCurveTo(39.475, 512.099, 0, 472.713, 0, 424.573), t.lineTo(0, 87.525), t.bezierCurveTo(0, 39.387, 39.475, 0, 87.723, 0), t.lineTo(424.278, 0), t.bezierCurveTo(472.525, 0, 512, 39.387, 512, 87.525), t.lineTo(512, 424.573), t.bezierCurveTo(512, 472.713, 472.525, 512.099, 424.278, 512.099), t.closePath(), t.restore()
        }
      }), t.exports = s
    },
    6897: (t, e, i) => {
      var n = i(5830),
        o = i(2114);

      function s(t) {
        n.call(this, t)
      }
      s.prototype = o.inheritPrototype(n, s, {
        pathForDot: function (t, e) {
          this.pathForSquareDot(t, e)
        }
      }), t.exports = s
    },
    9389: (t, e, i) => {
      var n = i(6074),
        o = i(1636),
        s = i(2114);

      function r(t, e) {
        if (o(this, r)) {
          var n = i(9536);
          Object.defineProperty(this, "_impl", {
            value: new n(this, t, e)
          })
        }
      }
      i(5156), r.prototype = s.inheritPrototype(n, r, {
        get size() {
          return this._impl.size
        },
        set size(t) {
          this._impl.size = t
        },
        get color() {
          return this._impl.color
        },
        set color(t) {
          this._impl.color = t
        },
        get glyphColor() {
          return this._impl.glyphColor
        },
        set glyphColor(t) {
          this._impl.glyphColor = t
        },
        get glyphImage() {
          return this._impl.glyphImage
        },
        set glyphImage(t) {
          this._impl.glyphImage = t
        },
        get selectedGlyphImage() {
          return this._impl.selectedGlyphImage
        },
        set selectedGlyphImage(t) {
          this._impl.selectedGlyphImage = t
        },
        get glyphText() {
          return this._impl.glyphText
        },
        set glyphText(t) {
          this._impl.glyphText = t
        },
        get titleVisibility() {
          return this._impl.titleVisibility
        },
        set titleVisibility(t) {
          this._impl.titleVisibility = t
        },
        get subtitleVisibility() {
          return this._impl.subtitleVisibility
        },
        set subtitleVisibility(t) {
          this._impl.subtitleVisibility = t
        }
      }), t.exports = r
    },
    6613: (t, e, i) => {
      var n = i(8928),
        o = i(311),
        s = i(4937),
        r = i(2114),
        a = [1, 2, 3, 2, 1],
        l = Math.tan(.820304748437335);

      function h(t) {
        n.call(this, t)
      }
      h.prototype = r.inheritPrototype(n, h, {
        get isBouncing() {
          return this._bounceAnimationFrameIndex >= 0
        },
        animateDropAfterLift: function () {
          var t = Math.max(this._dropAnimationStartP - Math.min((Date.now() - this._dropAfterLiftAnimationStartDate) / this.liftDurationMs, 1), 0),
            e = this.liftAmount * t;
          this._annotation.sceneGraphNode.transform = (new o).translate(0, -e), this._dropAnimationRevert || (e *= 1.25), this._annotation.sceneGraphNode.shadowTransform = (new o).translate(l * e, -e), 0 === t && (delete this._annotation.floating, this._annotation.sceneGraphNode.updateState(), delete this._dropAfterLiftAnimationStartDate, delete this._dropAnimationStartP, delete this._dropAnimationRevert, this._dequeueNextAnimation()), s.scheduleOnNextFrame(this)
        },
        animateLift: function () {
          var t = Math.min((Date.now() - this._liftAnimationStartDate) / this.liftDurationMs, 1),
            e = this.liftAmount * t;
          this._annotation.sceneGraphNode.transform = (new o).translate(this.translation.x, this.translation.y - e), this._shadowLiftDamping && (e = this.liftAmount * (1 + .25 * t)), this._annotation.sceneGraphNode.shadowTransform = (new o).translate(l * e, -e), t < 1 ? (s.scheduleOnNextFrame(this), this._liftAnimationProgress = t) : (delete this._liftAnimationStartDate, delete this._liftAnimationProgress, delete this._shadowLiftDamping, this._dequeueNextAnimation())
        },
        drop: function () {
          var t = this._annotation.position().y;
          this._pinVerticalTranslation = -t - 4, this._shadowHorizontalTranslation = l * -this._pinVerticalTranslation, this._shadowVerticalTranslation = this._pinVerticalTranslation;
          var e = t / this._annotation.delegate.mapForAnnotation(this._annotation._public)._impl.ensureRenderingFrame().size.height;
          this._dropDurationMs = 1e3 * Math.min(.35 * (e + (1 - e) / 2), 3), this._dropAnimationStartDate = Date.now(), this._annotation.floating = !0, this._annotation.sceneGraphNode.updateState(), this._animateDrop(), this._annotation._isAnimating = !0, this._animationQueue = [this._bounce, this._annotation.finishedAnimating.bind(this._annotation)], s.scheduleOnNextFrame(this)
        },
        dropAnnotationAfterDraggingAndRevertPosition: function (t) {
          var e = this._annotation.droppedAfterLift.bind(this._annotation);
          this._bounceAnimationFrameIndex >= 0 ? this._animationQueue = [e] : (this._liftAnimationStartDate ? (this._dropAnimationStartP = this._liftAnimationProgress, delete this._liftAnimationStartDate, delete this._liftAnimationProgress) : this._dropAnimationStartP = 1, t ? (this._dropAfterLift(), this._animationQueue = [this._bounce, e]) : (this._annotation.draggingDidEnd(), this._shadowLiftDamping = !0, this._animationQueue = [this._dropAfterLift, this._bounce, e], n.prototype.lift.call(this, this.nominalLiftAmount)), this._dropAnimationRevert = t, s.scheduleOnNextFrame(this))
        },
        lift: function (t) {
          this.nominalLiftAmount = t, this._animationQueue = [this._liftAfterBounce], this._bounce(), s.scheduleOnNextFrame(this)
        },
        setTranslation: function (t) {
          this.translation = t, this._bounceAnimationFrameIndex >= 0 || this._liftAnimationStartDate || (this._annotation.sceneGraphNode.transform = (new o).translate(t.x, t.y - this.liftAmount), this._annotation.sceneGraphNode.shadowTransform = (new o).translate(l * this.liftAmount, -this.liftAmount))
        },
        performScheduledUpdate: function () {
          this._dropAnimationStartDate ? this._animateDrop() : this._bounceAnimationFrameIndex >= 0 ? this._animateBounce() : n.prototype.performScheduledUpdate.call(this)
        },
        _animateBounce: function () {
          this._bounceAnimationFrameIndex < a.length ? (this._annotation.sceneGraphNode.updateState("down" + a[this._bounceAnimationFrameIndex]), ++this._bounceAnimationFrameIndex) : (delete this._bounceAnimationFrameIndex, this._dequeueNextAnimation()), s.scheduleOnNextFrame(this)
        },
        _animateDrop: function () {
          var t = Math.min((Date.now() - this._dropAnimationStartDate) / this._dropDurationMs, 1),
            e = 1 - t;
          this._annotation.sceneGraphNode.transform = (new o).translate(0, e * this._pinVerticalTranslation), this._annotation.sceneGraphNode.shadowTransform = (new o).translate(e * this._shadowHorizontalTranslation, e * this._shadowVerticalTranslation), 1 === t && (delete this._pinVerticalTranslation, delete this._shadowHorizontalTranslation, delete this._shadowVerticalTranslation, delete this._dropAnimationStartDate, delete this._dropDurationMs, this._annotation.floating = !1, this._annotation.sceneGraphNode.updateState(), this._dequeueNextAnimation()), s.scheduleOnNextFrame(this)
        },
        _bounce: function () {
          this._bounceAnimationFrameIndex = 0
        },
        _dequeueNextAnimation: function () {
          this._animationQueue.length > 0 && this._animationQueue.shift().call(this)
        },
        _dropAfterLift: function () {
          delete this.translation, this._dropAfterLiftAnimationStartDate = Date.now(), s.scheduleOnNextFrame(this)
        },
        _liftAfterBounce: function () {
          n.prototype.lift.call(this, this.nominalLiftAmount), this._annotation.floating = !0, this._annotation.sceneGraphNode.updateState()
        }
      }), t.exports = h
    },
    820: (t, e, i) => {
      var n = i(9615),
        o = i(6613),
        s = i(4140),
        r = i(210),
        a = i(311),
        l = i(2114),
        h = i(1232),
        c = new s(15, 36),
        d = {
          Red: "#ff3d38",
          Green: "#54d669",
          Purple: "#c969e0"
        },
        u = new window.DOMPoint(8, 35),
        p = new window.DOMPoint(-8, 0);

      function m(t) {
        function e(e, i, s) {
          this._animationController = new o(this), this._dragController = this._animationController, this._sceneGraphNode = new n(this), t.call(this, e, i, t.div, s), this._public = e, this.setSize(c), s && "color" in s && (this.color = s.color)
        }
        return e.Colors = d, e.prototype = l.inheritPrototype(t, e, {
          _animates: !0,
          _color: d.Red,
          _anchorPoint: u,
          _calloutAnchorPoint: p,
          renderedByDOMElement: !1,
          get size() {
            return c.copy()
          },
          set size(t) {
            console.warn("[MapKit] The `size` property of a pin annotation cannot be set.")
          },
          get color() {
            return this._color
          },
          set color(t) {
            l.checkType(t, "string", "[MapKit] Expected a string value for PinAnnotation.color, but got `" + t + "` instead"), t !== this._color && (this._color = t, this.updateLocalizedText(), this._sceneGraphNode.needsDisplay = !0)
          },
          get shouldPreventDrag() {
            return this._animationController.isBouncing
          },
          doesAnimate: function () {
            return this._animates
          },
          willMoveToMap: function (t) {
            this._isMoving = t && this.animates
          },
          didMoveToMap: function () {
            var e = this._isMoving;
            t.prototype.didMoveToMap.call(this), this.delegate && e && this.visible && !this._appearanceAnimation && this._shown && (this._isAnimating = !0, this._animationController.drop())
          },
          droppedAfterLift: function () {
            this.resetNodeTransform(), this._sceneGraphNode.updateState(), t.prototype.droppedAfterLift.call(this)
          },
          finishedAnimating: function () {
            this._sceneGraphNode.updateState(), t.prototype.finishedAnimating.call(this)
          },
          altText: function () {
            return t.prototype.altText.call(this) || (this._color === d.Green ? h.get("Annotation.Pin.Green.AccessibilityLabel") : this._color === d.Purple ? h.get("Annotation.Pin.Purple.AccessibilityLabel") : this._color === d.Red ? h.get("Annotation.Pin.Red.AccessibilityLabel") : h.get("Annotation.Pin.AccessibilityLabel"))
          },
          draggingDidEnd: function () {
            t.prototype.draggingDidEnd.call(this), t.prototype.updatePosition.call(this)
          },
          dragOffset: new r(0, 2),
          isAKnownOption: function (e) {
            return "color" === e || t.prototype.isAKnownOption.call(this, e)
          },
          resetNodeTransform: function () {
            this.sceneGraphNode.transform = new a
          }
        }), e
      }
      m.Colors = d, t.exports = m
    },
    8080: (t, e, i) => {
      var n = i(5077),
        o = i(820)(n);
      t.exports = o
    },
    9615: (t, e, i) => {
      var n = i(9328),
        o = i(4140),
        s = i(2114),
        r = i(2394);

      function a(t) {
        n.BaseNode.call(this), this.size = new o(32, 39), this._annotation = t, this._renderer = new r(this), this.updateState()
      }
      a.prototype = s.inheritPrototype(n.BaseNode, a, {
        get position() {
          return this._annotation.nodePosition()
        },
        stringInfo: function () {
          return "PinAnnotationNode" + (this._state ? "<" + this._state + ">" : "")
        },
        updateState: function (t) {
          t = this._annotation.floating ? "floating" : t || "", this._state !== t && (this._state = t, this.needsDisplay = !0)
        }
      }), t.exports = a
    },
    2394: (t, e, i) => {
      var n, o = i(9328),
        s = i(2114),
        r = i(3658),
        a = i(3032),
        l = i(2640),
        h = Math.min(r.devicePixelRatio, 3),
        c = (h > 1 ? "_" + h + "x" : "") + ".png",
        d = {},
        u = [],
        p = !1;

      function m(t) {
        o.RenderItem.call(this, t),
          function () {
            if (_) return;
            if (_ = !0, a.state === a.States.PENDING || a.state === a.States.READY) return void g();
            a.addEventListener(a.Events.Initialized, (function t() {
              a.removeEventListener(a.Events.Initialized, t), g()
            }))
          }()
      }

      function g() {
        var t = {},
          e = l.createImageUrl("pins/pin");

        function i(i, s) {
          var l = e + (i ? "-" : "") + i + "-" + s + c,
            h = r.htmlElement("img", {
              src: l
            }),
            d = {
              handleEvent: function (e) {
                switch (h.removeEventListener("load", d), h.removeEventListener("error", d), e.type) {
                  case "load":
                    t[i][s] = h;
                    break;
                  case "error":
                    console.warn("[MapKit] Error loading pin annotation image " + e.target.src + "; pin annotations may not display correctly."), p = !0
                }
                0 == --o && (n = t, u.forEach((function (t) {
                  t.needsDisplay = !0
                })), u = void 0)
              }
            };
          h.crossOrigin = r.getCorsAttribute(a.distUrlWithCredentials), h.addEventListener("load", d), h.addEventListener("error", d)
        }
        var o = ["", "floating", "down1", "down2", "down3"].reduce((function (e, n) {
          return t[n] = {}, i(n, "base"), i(n, "head"), e + 2
        }), 1);
        i("", "shadow")
      }
      m.prototype = s.inheritPrototype(o.RenderItem, m, {
        draw: function (t) {
          if (n) {
            var e = this._node,
              i = e.size.width,
              o = e.size.height;
            if (p) {
              ! function (t, e, i, n) {
                t.strokeStyle = "#ff4040", t.lineWidth = 2, t.strokeRect(0, e, i, n - e), t.beginPath(), t.moveTo(0, e), t.lineTo(i, n), t.moveTo(0, n), t.lineTo(i, e), t.stroke()
              }(t, o - e._annotation.size.height, e._annotation.size.width, o)
            } else {
              var s = e._state,
                r = e._annotation.color;
              if (d[r] || (d[r] = {}), !d[r][s]) {
                var a = document.createElement("canvas");
                a.width = i * h, a.height = o * h;
                var l = a.getContext("2d");
                l.fillStyle = r, l.fillRect(0, 0, a.width, a.height), l.save(), l.globalCompositeOperation = "destination-in", l.drawImage(n[s].head, 0, 0), l.restore(), l.drawImage(n[s].base, 0, 0), d[r][s] = a
              }
              e.shadowTransform && t.drawImage(n[""].shadow, e.shadowTransform.e, e.shadowTransform.f, i, o), t.drawImage(d[r][s], 0, 0, i, o)
            }
          } else u.indexOf(this._node) < 0 && u.push(this._node)
        }
      });
      var _ = !1;
      t.exports = m
    },
    8262: (t, e, i) => {
      var n = i(6074),
        o = i(1636),
        s = i(2114),
        r = i(820);

      function a(t, e) {
        if (o(this, a)) {
          console.warn("[MapKit] mapkit.PinAnnotation is deprecated and will be removed in a future release. Please use the newer mapkit.MarkerAnnotation class instead.");
          var n = i(8080);
          Object.defineProperty(this, "_impl", {
            value: new n(this, t, e)
          })
        }
      }
      a.Colors = r.Colors, a.prototype = s.inheritPrototype(n, a, {
        get size() {
          return this._impl.size
        },
        set size(t) {
          this._impl.size = t
        },
        get color() {
          return this._impl._color
        },
        set color(t) {
          this._impl.color = t
        }
      }), t.exports = a
    },
    7137: (t, e, i) => {
      var n = i(5077),
        o = i(6532),
        s = i(1232),
        r = i(2114),
        a = i(8006).Tints,
        l = i(4140),
        h = i(1692),
        c = i(975),
        d = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);

      function u(t, e) {
        var i = c.SystemColors.default,
          s = {
            INNER_RADIUS: 8,
            OUTER_RADIUS: 11,
            SHADOW_BLUR: 10,
            TOTAL_RADIUS: 0,
            OUTER_FILL: [255, 255, 255],
            STALE_FILL: i.gray2,
            SHADOW_COLOR: [0, 0, 0, .25],
            ANIMATION_DURATION_MS: 3e3,
            ANIMATION_HALF_DURATION_MS: 0,
            ANIMATION_SCALE_FROM: 1,
            ANIMATION_SCALE_TO: .81,
            ANIMATION_FILL_FROM: i.blue,
            ANIMATION_FILL_TO: i.blue
          };
        s.TOTAL_RADIUS = s.OUTER_RADIUS + s.SHADOW_BLUR, s.ANIMATION_HALF_DURATION_MS = s.ANIMATION_DURATION_MS / 2;
        var r = s.TOTAL_RADIUS,
          a = s.SHADOW_BLUR,
          d = window.DOMPoint;
        this.style = s, this.stale = !1, this._animationScheduler = h, this._anchorOffset = new d(0, -r), this._calloutAnchorPoint = new d(-r, -a), n.call(this, t, e.coordinate, n.div), this._updateTitleAndSubtitleForLocale();
        var u = 2 * r;
        this.setSize(new l(u, u)), this._userSetSize = !0, this._sceneGraphNode = new o(this), this.shownPropertyWasUpdated(!0)
      }
      u.prototype = r.inheritPrototype(n, u, {
        _collisionMode: n.CollisionMode.None,
        renderedByDOMElement: !1,
        get coordinate() {
          return this._coordinate
        },
        set coordinate(t) {
          d(this, "_coordinate") ? console.warn("[MapKit] The `coordinate` property of the user location annotation cannot be set.") : this._coordinate = t.copy()
        },
        get draggable() {
          return !1
        },
        set draggable(t) {
          console.warn("[MapKit] The `draggable` property of the user location annotation cannot be set.")
        },
        get size() {
          return this._node.size.copy()
        },
        set size(t) {
          console.warn("[MapKit] The `size` property of the user location annotation cannot be set.")
        },
        get node() {
          return this._node
        },
        handleEvent: function (t) {
          t.type === s.Events.LocaleChanged && this._updateTitleAndSubtitleForLocale()
        },
        shownPropertyWasUpdated: function (t) {
          h.setIsAnimated(this, t)
        },
        removedFromMap: function () {
          h.setIsAnimated(this, !1), s.removeEventListener(s.Events.LocaleChanged, this)
        },
        setCoordinate: function (t) {
          Object.getOwnPropertyDescriptor(n.prototype, "coordinate").set.call(this, t)
        },
        performScheduledUpdate: function () {
          var t = this.map && this.map.colorScheme,
            e = this.map && this.map.mapType,
            i = c.SystemColors.default,
            n = c.SystemColors[a.Light],
            o = c.SystemColors[a.Dark],
            s = c.SystemColors[t] || i,
            r = e === c.MapTypes.Satellite || e === c.MapTypes.Hybrid ? "satellite" : t === a.Dark ? "dark" : "light";
          this.style.OUTER_FILL = "dark" === r ? n.gray3 : [255, 255, 255], this.style.STALE_FILL = "light" === r ? n.gray : o.gray2, this.style.ANIMATION_FILL_FROM = s.blue, this.style.ANIMATION_FILL_TO = s.blue, this.style.SHADOW_COLOR = [0, 0, 0, "light" === r ? .25 : .3], this._sceneGraphNode.needsDisplay = !0
        },
        _updateTitleAndSubtitleForLocale: function () {
          this.title = s.get("Location.Title"), this.subtitle = s.get("Location.Subtitle")
        }
      }), t.exports = u
    },
    6532: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = i(7820);

      function r(t) {
        n.BaseNode.call(this), this._annotation = t, this._renderer = new s(this)
      }
      r.prototype = o.inheritPrototype(n.BaseNode, r, {
        stringInfo: function () {
          return "UserLocationAnnotationNode< " + (this._renderer.stale ? "stale " : "live ") + ">"
        },
        get size() {
          return this._annotation.node.size
        },
        get position() {
          return this._annotation.nodePosition()
        }
      }), t.exports = r
    },
    7820: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = i(3658),
        r = i(1692);

      function a(t) {
        n.RenderItem.call(this, t), this.opacity = null, this.opacityTime = 0
      }
      a.prototype = o.inheritPrototype(n.RenderItem, a, {
        draw: function (t) {
          var e, i, n, o = this._node._annotation.stale,
            a = this._node._annotation.style,
            l = r.getClock(),
            h = l - this.opacityTime,
            c = Math.min(h, 500) / 500,
            d = s.lerp(c, 1 - this.opacity, this.opacity);
          if (d > 0) {
            var u = a.ANIMATION_HALF_DURATION_MS,
              p = l % a.ANIMATION_DURATION_MS,
              m = s.easeInOut(p < u ? 1 - p / u : (p - u) / u),
              g = s.lerp(m, a.ANIMATION_SCALE_TO, a.ANIMATION_SCALE_FROM),
              _ = t.globalAlpha,
              f = a.INNER_RADIUS * g,
              y = a.OUTER_RADIUS - f,
              v = f + y / 2,
              w = a.TOTAL_RADIUS,
              b = a.TOTAL_RADIUS;
            t.save(), t.globalAlpha = d, t.beginPath(), t.arc(w, b, v, 0, 2 * Math.PI), t.strokeStyle = "rgb(" + a.OUTER_FILL.join(",") + ")", t.shadowColor = "rgba(" + a.SHADOW_COLOR.join(",") + ")", t.shadowBlur = a.SHADOW_BLUR, t.lineWidth = y, t.stroke(), t.restore(), t.globalAlpha = d, t.beginPath(), t.arc(w, b, f, 0, 2 * Math.PI), t.fillStyle = o ? "rgb(" + a.STALE_FILL.join(",") + ")" : (e = a.ANIMATION_FILL_FROM, i = a.ANIMATION_FILL_TO, n = m, "rgb(" + e.map((function (t, e) {
              return Math.round(t + (i[e] - t) * n)
            })).join(", ") + ")"), t.fill(), t.globalAlpha = _
          }
        }
      }), t.exports = a
    },
    1364: (t, e, i) => {
      var n = i(1692),
        o = i(6074),
        s = i(2114);

      function r(t) {
        var e = i(7137);
        Object.defineProperty(this, "_impl", {
          value: new e(this, t)
        })
      }
      var a = function () {
        throw new TypeError("[MapKit] UserLocationAnnotation may not be constructed.")
      };
      r.prototype = a.prototype = s.inheritPrototype(o, a, {
        set coordinate(t) {
          this._impl.coordinate = t
        },
        set isRingMode(t) {
          var e = this._impl._sceneGraphNode._renderer,
            i = t ? 0 : 1;
          i !== e.opacity && (e.opacity = i, e.opacityTime = n.getClock())
        },
        get coordinate() {
          return this._impl.coordinate
        },
        get draggable() {
          return this._impl.draggable
        },
        set draggable(t) {
          this._impl.draggable = t
        },
        get size() {
          return this._impl.size
        },
        set size(t) {
          this._impl.size = t
        }
      }), t.exports = r
    },
    6246: t => {
      var e = "function" == typeof ErrorEvent;
      t.exports = function (t, i, n, o) {
        if (!e) return t.apply(i, n);
        try {
          return t.apply(i, n)
        } catch (t) {
          console.error(t);
          var s = new ErrorEvent("error", {
            message: t.message || t.toString() || "(Unknown error)",
            filename: t.fileName || t.stack || "(Unknown filename)",
            lineno: t.lineNumber,
            colno: t.columnNumber,
            error: t
          });
          return window.dispatchEvent(s), o
        }
      }
    },
    1636: t => {
      t.exports = function (t, e) {
        return t instanceof e || (console.warn("[MapKit] Unexpected object instance. Did you forget to `new`?"), "function" == typeof console.trace && console.trace(), !1)
      }
    },
    647: (t, e, i) => {
      var n = {
        mapkit: {}
      },
        o = i(809),
        s = i(5360);
      [o, i(2243), s].forEach((function (t) {
        Object.keys(t).forEach((function (e) {
          "mapkit" !== e ? n[e] = t[e] : Object.keys(t.mapkit).forEach((function (e) {
            n.mapkit[e] = t.mapkit[e]
          }))
        }))
      })), t.exports = n
    },
    6408: (t, e, i) => {
      t.exports = function (t) {
        t.IS_CHUNKED = !1, t.loadAll = function () {
          var t = i(647);
          this._chunkLoaded("all", t)
        }
      }
    },
    6783: (t, e, i) => {
      var n = i(8961),
        o = {
          Libraries: ["services", "map", "legacy"],
          Events: {
            LOAD: "load",
            LOAD_ERROR: "load-error"
          },
          jsModules: {
            mapkit: {}
          },
          _chunkLoaded: function (t, e) {
            Object.keys(e).forEach(function (t) {
              "mapkit" !== t ? this.jsModules[t] = e[t] : Object.keys(e.mapkit).forEach(function (t) {
                this.jsModules.mapkit[t] = e.mapkit[t]
              }.bind(this))
            }.bind(this));
            var i = new n.Event("load");
            i.libraryName = t, i.jsModules = e, this.dispatchEvent(i)
          }
        };
      n.EventTarget(o), t.exports = o
    },
    2243: (t, e, i) => {
      t.exports = {
        mapkit: {
          PinAnnotation: i(8262)
        }
      }
    },
    809: (t, e, i) => {
      var n = i(6572),
        o = i(9601);
      t.exports = {
        MapInternal: i(9455),
        PointOfInterestFilter: n,
        css: i(1998),
        utils: i(3658),
        mapkit: {
          importGeoJSON: i(4526),
          FeatureVisibility: i(975).FeatureVisibility,
          CoordinateRegion: o.CoordinateRegion,
          CoordinateSpan: o.CoordinateSpan,
          Coordinate: o.Coordinate,
          BoundingRegion: o.BoundingRegion,
          MapPoint: o.MapPoint,
          MapRect: o.MapRect,
          MapSize: o.MapSize,
          Padding: i(7094),
          CameraZoomRange: o.CameraZoomRange,
          Map: i(3188),
          Style: i(584),
          LineGradient: i(7616),
          CircleOverlay: i(3462),
          PolylineOverlay: i(9944),
          PolygonOverlay: i(6459),
          Annotation: i(6074),
          ImageAnnotation: i(7199),
          MarkerAnnotation: i(9389),
          TileOverlay: i(3306).TileOverlay,
          PointOfInterestCategory: i(5161),
          PointOfInterestFilter: n.exposedConstructor,
          get filterIncludingAllCategories() {
            return n.filterIncludingAllCategories
          },
          get filterExcludingAllCategories() {
            return n.filterExcludingAllCategories
          }
        }
      }
    },
    5360: (t, e, i) => {
      var n = i(9601);
      t.exports = {
        mapkit: {
          CoordinateRegion: n.CoordinateRegion,
          CoordinateSpan: n.CoordinateSpan,
          Coordinate: n.Coordinate,
          BoundingRegion: n.BoundingRegion,
          MapPoint: n.MapPoint,
          MapRect: n.MapRect,
          MapSize: n.MapSize,
          Geocoder: i(6701),
          Search: i(955),
          Directions: i(4802),
          PointsOfInterestSearch: i(2333)
        }
      }
    },
    1127: t => {
      "use strict";

      function e(t, e) {
        this.items = t, this.data = e
      }
      e.prototype = {
        constructor: e,
        get data() {
          return this._data
        },
        set data(t) {
          this._data = t
        },
        get items() {
          return this._items
        },
        set items(t) {
          this._items = t instanceof Array ? t : null === t ? [] : [t]
        },
        getFlattenedItemList: function () {
          return this.items.reduce((function (t, e) {
            var i = "function" == typeof e.getFlattenedItemList ? e.getFlattenedItemList(e) : e;
            return t.concat(i)
          }), [])
        }
      }, t.exports = e
    },
    8079: (t, e, i) => {
      var n = i(1127);

      function o(t, e) {
        Object.defineProperty(this, "_impl", {
          value: new n(t, e)
        })
      }
      o.prototype = {
        get data() {
          return this._impl.data
        },
        set data(t) {
          this._impl.data = t
        },
        get items() {
          return this._impl._items
        },
        set items(t) {
          this._impl.items = t
        },
        getFlattenedItemList: function () {
          return this._impl.getFlattenedItemList()
        }
      }, t.exports = o
    },
    3032: (t, e, i) => {
      var n = i(4891),
        o = i(9353),
        s = i(2114),
        r = i(8961);

      function a() { }
      a.prototype = s.inheritPrototype(o, a, {
        get forcedRenderingMode() {
          return this._forcedRenderingMode
        },
        get didFallback() {
          return this._syrupRequestedFallback
        },
        get fallbackType() {
          return this._syrupRequestedFallbackType
        },
        get proxyPrefixes() {
          return this._proxyPrefixes
        },
        get withCredentials() {
          return this.proxyPrefixes && /\b\.geo\.apple\.com\b/.test(this.proxyPrefixes[0])
        },
        get distUrlWithCredentials() {
          return this._distUrl ? /\bproxy\.geo\.apple\.com\b/.test(this._distUrl) : !n.useLocalResources && this.withCredentials
        },
        get syrupUrlWithCredentials() {
          return this._syrupUrl ? /\bproxy\.geo\.apple\.com\b/.test(this._syrupUrl) : this.withCredentials
        },
        init: function (t) {
          t && "object" == typeof t && ("_previewLoCSR" in t && t._previewLoCSR && (this._forcedRenderingMode = "HYBRID", delete t._previewLoCSR), "_forcedRenderingMode" in t && (this._forcedRenderingMode = t._forcedRenderingMode, delete t._forcedRenderingMode), "_proxyPrefixes" in t && Array.isArray(t._proxyPrefixes) && (this._proxyPrefixes = t._proxyPrefixes, delete t._proxyPrefixes), "_distUrl" in t && (this._distUrl = t._distUrl), "_syrupUrl" in t && (this._syrupUrl = t._syrupUrl)), o.prototype.init.call(this, t, "[MapKit] mapkit.init(): ");
          var e = new r.Event(this.Events.Initialized);
          this.dispatchEvent(e)
        }
      });
      var l = new a;
      l.withParameters({
        mkjsVersion: n.version,
        poi: "1"
      }), t.exports = l
    },
    975: (t, e, i) => {
      var n = i(4140),
        o = {
          blue: [0, 122, 255],
          green: [52, 199, 89],
          indigo: [88, 86, 214],
          orange: [255, 149, 0],
          pink: [255, 45, 85],
          purple: [175, 82, 222],
          red: [255, 59, 48],
          teal: [90, 200, 250],
          yellow: [255, 204, 0],
          gray: [142, 142, 147],
          gray2: [174, 174, 178],
          gray3: [199, 199, 204],
          gray4: [209, 209, 214],
          gray5: [229, 229, 234],
          gray6: [242, 242, 247]
        };
      t.exports = {
        MapTypes: {
          Satellite: "satellite",
          Hybrid: "hybrid",
          MutedStandard: "mutedStandard",
          Standard: "standard"
        },
        Distances: {
          Adaptive: "adaptive",
          Metric: "metric",
          Imperial: "imperial"
        },
        Emphasis: {
          Muted: "muted",
          Standard: "standard"
        },
        FeatureVisibility: {
          Adaptive: "adaptive",
          Hidden: "hidden",
          Visible: "visible"
        },
        SystemColors: {
          default: o,
          light: o,
          dark: {
            blue: [10, 132, 255],
            green: [48, 209, 88],
            indigo: [94, 92, 230],
            orange: [255, 159, 10],
            pink: [255, 55, 95],
            purple: [191, 90, 242],
            red: [255, 69, 58],
            teal: [100, 210, 255],
            yellow: [255, 214, 10],
            gray: [142, 142, 147],
            gray2: [99, 99, 102],
            gray3: [72, 72, 74],
            gray4: [58, 58, 60],
            gray5: [44, 44, 46],
            gray6: [28, 28, 30]
          }
        },
        MarkerAnnotationFontFamily: '"SFProRegular", "-apple-system", "BlinkMacSystemFont", "Helvetica Neue", Helvetica, Arial, sans-serif',
        MapTiledLayerMinZoomLevel: 2,
        MapTiledLayerMaxZoomLevel: 20,
        ZoomTypes: {
          Button: "BUTTON",
          Scroll: "SCROLL",
          DoubleTap: "DOUBLE_TAP",
          Pinch: "PINCH"
        },
        MapSizes: {
          minimumSizeToShowControls: new n(306, 220),
          minimumSizeToShowLogo: new n(200, 100),
          minimumSizeToShowLogoWithReducedMargin: new n(100, 100)
        },
        MaximumRestrictedRotation: 30
      }
    },
    295: t => {
      t.exports = ".mk-rotation-control,.mk-top-right-controls-container:not(.mk-pill-pressed):not(.mk-pill-focus):not(:empty),.mk-zoom-controls{box-shadow:0 0 0 .5px rgba(0,0,0,.05)}.mk-focus .mk-zoom-in,.mk-focus .mk-zoom-out,.mk-pill-focus .mk-map-type-control,.mk-pill-focus .mk-user-location-control,.mk-pill-pressed .mk-map-type-control,.mk-pill-pressed .mk-user-location-control,.mk-pill-pressed .mk-zoom-in,.mk-pill-pressed .mk-zoom-out,.mk-rotation-control,.mk-top-right-controls-container:not(.mk-pill-pressed):not(.mk-pill-focus):not(:empty),.mk-zoom-controls:not(.mk-pill-pressed):not(.mk-focus){background-color:#fff}.mk-map-type-control.mk-pressed,.mk-rotation-control.mk-pressed,.mk-user-location-control.mk-pressed,.mk-zoom-controls .mk-zoom-in.mk-pressed:not(.mk-disabled),.mk-zoom-controls .mk-zoom-out.mk-pressed:not(.mk-disabled){background-color:#e5e5e5}.mk-legal-controls.mk-focus,.mk-map-type-control:focus,.mk-rotation-control.mk-focus,.mk-user-location-control:focus,.mk-zoom-controls.mk-focus .mk-zoom-in:focus,.mk-zoom-controls.mk-focus .mk-zoom-out:focus{background-color:#cce5ff}.mk-map-type-control.mk-focus.mk-pressed,.mk-rotation-control.mk-focus.mk-pressed,.mk-user-location-control.mk-focus.mk-pressed,.mk-zoom-controls.mk-focus .mk-zoom-in.mk-pressed:focus,.mk-zoom-controls.mk-focus .mk-zoom-out.mk-pressed:focus{background-color:#7fbdff}.mk-legal-controls.mk-focus,.mk-map-type-control:focus,.mk-pill-focus .mk-map-type-control,.mk-pill-focus .mk-user-location-control,.mk-rotation-control.mk-focus,.mk-user-location-control:focus,.mk-zoom-controls.mk-focus{box-shadow:0 0 0 2px #007cff}.mk-zoom-controls.mk-focus .mk-divider{border-left:2px solid #007cff}.mk-map-type-control .mk-icon,.mk-user-location-control .mk-icon,.mk-zoom-controls .mk-icon{fill:#000}:host(.mk-controls-container) .mk-popover{background-color:#efefef;color:#000;border-color:transparent;box-shadow:0 5px 10px 0 rgba(0,0,0,.3)}:host(.mk-controls-container) .mk-popover-arrow{fill:#efefef}.mk-error-message{color:#333}.mk-error-message a{color:#007aff}.mk-error-message a:visited{color:#af52de}.mk-legal-controls .mk-legal{color:rgba(0,0,0,.7);text-shadow:0 0 1px rgba(255,255,255,.85)}.mk-rotation-control .mk-heading{color:#000}.mk-popover .mk-map-type-button-control{box-shadow:0 0 0 .5px rgb(0,0,0,.14)}.mk-popover .mk-map-type-button-control.mk-selected{box-shadow:0 0 0 2px #007cff}.mk-popover.mk-focus-style .mk-map-type-button-control:focus{box-shadow:0 0 0 4px rgba(0,124,255,.4)}.mk-popover.mk-focus-style .mk-map-type-button-control.mk-selected:focus{box-shadow:0 0 0 2px #007cff,0 0 0 4px rgba(0,124,255,.4)}.mk-map-type-button-control.mk-pressed::after{background-color:rgba(0,0,0,.25)}@supports ((backdrop-filter:blur(30px)) or (-webkit-backdrop-filter:blur(30px))){.mk-focus .mk-zoom-in,.mk-focus .mk-zoom-out,.mk-pill-focus .mk-map-type-control,.mk-pill-focus .mk-user-location-control,.mk-pill-pressed .mk-map-type-control,.mk-pill-pressed .mk-user-location-control,.mk-pill-pressed .mk-zoom-in,.mk-pill-pressed .mk-zoom-out,.mk-rotation-control,.mk-top-right-controls-container:not(.mk-pill-pressed):not(.mk-pill-focus):not(:empty),.mk-zoom-controls:not(.mk-pill-pressed):not(.mk-focus){background-color:rgba(255,255,255,.75)}.mk-map-type-control.mk-pressed,.mk-rotation-control.mk-pressed,.mk-user-location-control.mk-pressed,.mk-zoom-controls .mk-zoom-in.mk-pressed:not(.mk-disabled),.mk-zoom-controls .mk-zoom-out.mk-pressed:not(.mk-disabled){background-color:rgba(229,229,229,.6)}.mk-legal-controls.mk-focus,.mk-map-type-control.mk-focus,.mk-rotation-control.mk-focus,.mk-user-location-control.mk-focus,.mk-zoom-controls.mk-focus .mk-zoom-in:focus,.mk-zoom-controls.mk-focus .mk-zoom-out:focus{background-color:rgba(204,229,255,.6)}.mk-map-type-control.mk-focus.mk-pressed,.mk-rotation-control.mk-focus.mk-pressed,.mk-user-location-control.mk-focus.mk-pressed,.mk-zoom-controls.mk-focus .mk-zoom-in.mk-pressed:focus,.mk-zoom-controls.mk-focus .mk-zoom-out.mk-pressed:focus{background-color:rgb(127,189,255,.6)}}:host(.mk-dark-mode) .mk-rotation-control,:host(.mk-dark-mode) .mk-top-right-controls-container:not(.mk-pill-pressed):not(.mk-pill-focus):not(:empty),:host(.mk-dark-mode) .mk-zoom-controls{box-shadow:0 0 0 .5px rgba(255,255,255,.05)}:host(.mk-dark-mode) .mk-focus .mk-zoom-in,:host(.mk-dark-mode) .mk-focus .mk-zoom-out,:host(.mk-dark-mode) .mk-pill-focus .mk-map-type-control,:host(.mk-dark-mode) .mk-pill-focus .mk-user-location-control,:host(.mk-dark-mode) .mk-pill-pressed .mk-map-type-control,:host(.mk-dark-mode) .mk-pill-pressed .mk-user-location-control,:host(.mk-dark-mode) .mk-pill-pressed .mk-zoom-in,:host(.mk-dark-mode) .mk-pill-pressed .mk-zoom-out,:host(.mk-dark-mode) .mk-rotation-control,:host(.mk-dark-mode) .mk-top-right-controls-container:not(.mk-pill-pressed):not(.mk-pill-focus):not(:empty),:host(.mk-dark-mode) .mk-zoom-controls:not(.mk-pill-pressed):not(.mk-focus){background-color:#121212}:host(.mk-dark-mode) .mk-map-type-control.mk-pressed,:host(.mk-dark-mode) .mk-user-location-control.mk-pressed,:host(.mk-dark-mode) .mk-zoom-controls .mk-zoom-in.mk-pressed:not(.mk-disabled),:host(.mk-dark-mode) .mk-zoom-controls .mk-zoom-out.mk-pressed:not(.mk-disabled){background-color:#2a2a2a}:host(.mk-dark-mode) .mk-legal-controls.mk-focus,:host(.mk-dark-mode) .mk-map-type-control.mk-focus,:host(.mk-dark-mode) .mk-rotation-control.mk-focus,:host(.mk-dark-mode) .mk-user-location-control.mk-focus,:host(.mk-dark-mode) .mk-zoom-controls.mk-focus .mk-zoom-in:focus,:host(.mk-dark-mode) .mk-zoom-controls.mk-focus .mk-zoom-out:focus{background-color:#0c3159}:host(.mk-dark-mode) .mk-map-type-control.mk-focus.mk-pressed,:host(.mk-dark-mode) .mk-rotation-control.mk-focus.mk-pressed,:host(.mk-dark-mode) .mk-user-location-control.mk-focus.mk-pressed,:host(.mk-dark-mode) .mk-zoom-controls.mk-focus .mk-zoom-in.mk-pressed:focus,:host(.mk-dark-mode) .mk-zoom-controls.mk-focus .mk-zoom-out.mk-pressed:focus{background-color:#0366cf}:host(.mk-dark-mode) .mk-legal-controls.mk-focus,:host(.mk-dark-mode) .mk-map-type-control:focus,:host(.mk-dark-mode) .mk-pill-focus .mk-map-type-control,:host(.mk-dark-mode) .mk-pill-focus .mk-user-location-control,:host(.mk-dark-mode) .mk-rotation-control.mk-focus,:host(.mk-dark-mode) .mk-user-location-control:focus,:host(.mk-dark-mode) .mk-zoom-controls.mk-focus{box-shadow:0 0 0 2px #007cff}:host(.mk-dark-mode) .mk-map-type-control .mk-icon,:host(.mk-dark-mode) .mk-user-location-control .mk-icon,:host(.mk-dark-mode) .mk-zoom-controls .mk-icon{fill:#fff}:host(.mk-controls-container.mk-dark-mode) .mk-popover{background-color:#363636;color:#fff;border-color:#5a5c64}:host(.mk-controls-container.mk-dark-mode) .mk-popover-arrow{fill:#363636}:host(.mk-controls-container.mk-dark-mode) .mk-popover-arrow path{stroke:#5a5c64}:host(.mk-dark-mode) .mk-error-message{color:rgba(255,255,255,.85)}:host(.mk-dark-mode) .mk-error-message a{color:#0a84ff}:host(.mk-dark-mode) .mk-error-message a:visited{color:#bf5af2}:host(.mk-dark-mode) .mk-legal-controls .mk-legal{color:rgba(255,255,255,.9);text-shadow:0 0 1px rgba(0,0,0,.5),0 0 10px rgba(0,0,0,1)}:host(.mk-dark-mode) .mk-rotation-control .mk-heading{color:#fff}:host(.mk-dark-mode) .mk-popover .mk-map-type-button-control:not(:focus):not(.mk-selected),:host(.mk-dark-mode) .mk-popover:not(.mk-focus-style) .mk-map-type-button-control:focus:not(.mk-selected){box-shadow:0 0 0 .5px rgb(255,255,255,.3)}@supports ((backdrop-filter:blur(30px)) or (-webkit-backdrop-filter:blur(30px))){:host(.mk-dark-mode) .mk-focus .mk-zoom-in,:host(.mk-dark-mode) .mk-focus .mk-zoom-out,:host(.mk-dark-mode) .mk-pill-focus .mk-map-type-control,:host(.mk-dark-mode) .mk-pill-focus .mk-user-location-control,:host(.mk-dark-mode) .mk-pill-pressed .mk-map-type-control,:host(.mk-dark-mode) .mk-pill-pressed .mk-user-location-control,:host(.mk-dark-mode) .mk-pill-pressed .mk-zoom-in,:host(.mk-dark-mode) .mk-pill-pressed .mk-zoom-out,:host(.mk-dark-mode) .mk-rotation-control,:host(.mk-dark-mode) .mk-top-right-controls-container:not(.mk-pill-pressed):not(.mk-pill-focus):not(:empty),:host(.mk-dark-mode) .mk-zoom-controls:not(.mk-pill-pressed):not(.mk-focus){background-color:rgba(18,18,18,.6)}:host(.mk-dark-mode) .mk-map-type-control.mk-pressed,:host(.mk-dark-mode) .mk-rotation-control.mk-pressed,:host(.mk-dark-mode) .mk-type-control.mk-pressed,:host(.mk-dark-mode) .mk-user-location-control.mk-pressed,:host(.mk-dark-mode) .mk-zoom-controls .mk-zoom-in.mk-pressed:not(.mk-disabled),:host(.mk-dark-mode) .mk-zoom-controls .mk-zoom-out.mk-pressed:not(.mk-disabled){background-color:rgba(42,42,42,.6)}:host(.mk-dark-mode) .mk-legal-controls.mk-focus,:host(.mk-dark-mode) .mk-map-type-control.mk-focus,:host(.mk-dark-mode) .mk-rotation-control.mk-focus,:host(.mk-dark-mode) .mk-user-location-control.mk-focus,:host(.mk-dark-mode) .mk-zoom-controls.mk-focus .mk-zoom-in:focus,:host(.mk-dark-mode) .mk-zoom-controls.mk-focus .mk-zoom-out:focus{background-color:rgba(12,49,89,.6)}:host(.mk-dark-mode) .mk-map-type-control.mk-focus.mk-pressed,:host(.mk-dark-mode) .mk-rotation-control.mk-focus.mk-pressed,:host(.mk-dark-mode) .mk-user-location-control.mk-focus.mk-pressed,:host(.mk-dark-mode) .mk-zoom-controls.mk-focus .mk-zoom-in.mk-pressed:focus,:host(.mk-dark-mode) .mk-zoom-controls.mk-focus .mk-zoom-out.mk-pressed:focus{background-color:rgb(3,102,207,.6)}}"
    },
    2713: t => {
      t.exports = '@media (inverted-colors){:host(.mk-controls-container) img{filter:initial}}:host(.mk-controls-container) *{box-sizing:content-box}:host(.mk-controls-container) ::selection{background:0 0}.mk-error-message{font-family:"-apple-system-font","Helvetica Neue",Helvetica,Arial,sans-serif;font-size:13px;width:200px;padding:10px;pointer-events:auto}.mk-error-support{white-space:nowrap}:host(.mk-controls-container) :focus{outline:0}.mk-logo-control .mk-logo{vertical-align:bottom;width:auto}:host(.mk-controls-container) div.mk-logo-control img.mk-logo{width:82px;height:24px;margin:0}:host(.mk-controls-container) div.mk-logo-control img.mk-logo.mk-logo-autonavi.mk-logo-autonavi{width:68px;height:45px}.mk-legal-controls{height:16px;padding:0 9px;margin:2px;border-radius:5px;pointer-events:auto;z-index:1;text-align:center;vertical-align:middle;line-height:12px;cursor:pointer}.mk-legal-controls .mk-legal{display:inline-block;font:9px "-apple-system-font","Helvetica Neue",Helvetica,Arial,sans-serif;font-weight:500;text-decoration:underline;pointer-events:none;white-space:nowrap}.mk-zoom-controls{width:48px;height:24px;border-radius:9px;pointer-events:auto}.mk-zoom-controls .mk-zoom-in .mk-icon,.mk-zoom-controls .mk-zoom-out .mk-icon{pointer-events:none;opacity:.55}.mk-zoom-controls .mk-zoom-in.mk-pressed .mk-icon,.mk-zoom-controls .mk-zoom-in:focus .mk-icon,.mk-zoom-controls .mk-zoom-out.mk-pressed .mk-icon,.mk-zoom-controls .mk-zoom-out:focus .mk-icon{opacity:.85}@media not all and (hover:none){.mk-zoom-controls .mk-zoom-in:hover .mk-icon,.mk-zoom-controls .mk-zoom-out:hover .mk-icon{opacity:.85}}.mk-zoom-controls .mk-zoom-in.mk-disabled .mk-icon,.mk-zoom-controls .mk-zoom-out.mk-disabled .mk-icon{opacity:.2}.mk-zoom-controls .mk-zoom-in,.mk-zoom-controls .mk-zoom-out{position:absolute;z-index:2;width:24px;height:24px;cursor:pointer}.mk-zoom-controls .mk-divider{position:absolute;left:23px;width:2px;height:24px;box-sizing:border-box;z-index:100}.mk-top-right-controls-container{border-radius:9px;height:24px}:host(.mk-controls-container) .mk-map-type-control,:host(.mk-controls-container) .mk-user-location-control{cursor:pointer;height:24px;width:45px;pointer-events:auto;display:inline-block;position:relative}:host(.mk-controls-container) .mk-user-location-control .mk-icon{position:absolute;left:0;height:24px;width:45px;transition:transform .2s ease-in-out}:host(.mk-controls-container) .mk-pill-focus .mk-map-type-control,:host(.mk-controls-container) .mk-pill-focus .mk-user-location-control{width:44px}:host(.mk-controls-container) .mk-user-location-control .mk-scaled-out{transform:scale(0)}:host(.mk-controls-container) .mk-user-location-control .mk-icon.mk-icon-waiting rect{animation:.8s infinite mk-spinner}:host(.mk-controls-container) .mk-user-location-control .mk-icon.mk-icon-waiting rect:nth-child(2){animation-delay:-.1s}:host(.mk-controls-container) .mk-user-location-control .mk-icon.mk-icon-waiting rect:nth-child(3){animation-delay:-.2s}:host(.mk-controls-container) .mk-user-location-control .mk-icon.mk-icon-waiting rect:nth-child(4){animation-delay:-.3s}:host(.mk-controls-container) .mk-user-location-control .mk-icon.mk-icon-waiting rect:nth-child(5){animation-delay:-.4s}:host(.mk-controls-container) .mk-user-location-control .mk-icon.mk-icon-waiting rect:nth-child(6){animation-delay:-.5s}:host(.mk-controls-container) .mk-user-location-control .mk-icon.mk-icon-waiting rect:nth-child(7){animation-delay:-.6s}:host(.mk-controls-container) .mk-user-location-control .mk-icon.mk-icon-waiting rect:nth-child(8){animation-delay:-.7s}@keyframes mk-spinner{0%{opacity:1}88%{opacity:.15}}:host(.mk-controls-container) .mk-map-type-control .mk-icon,:host(.mk-controls-container) .mk-user-location-control .mk-icon{pointer-events:none;opacity:.55}:host(.mk-controls-container) .mk-map-type-control.mk-pressed .mk-icon,:host(.mk-controls-container) .mk-map-type-control:focus .mk-icon,:host(.mk-controls-container) .mk-map-type-control:hover .mk-icon,:host(.mk-controls-container) .mk-user-location-control.mk-pressed .mk-icon,:host(.mk-controls-container) .mk-user-location-control:focus .mk-icon,:host(.mk-controls-container) .mk-user-location-control:hover .mk-icon{opacity:.85}@media (hover:none){:host(.mk-controls-container) .mk-map-type-control:hover:not(.mk-pressed):not(:focus) .mk-icon,:host(.mk-controls-container) .mk-user-location-control:hover:not(.mk-pressed):not(:focus) .mk-icon{opacity:.55}}:host(.mk-controls-container) .mk-popover{visibility:hidden;transform:scale(.5);opacity:0;border-radius:10px;transition:.2s opacity cubic-bezier(.25,.1,.25,1),.2s visibility step-end,.2s transform step-end;will-change:transform,opacity,visibility;border-width:1px;border-style:solid;cursor:default}:host(.mk-controls-container) .mk-popover.mk-shown{visibility:visible;pointer-events:auto;transform:none;opacity:1;transition:.2s transform cubic-bezier(.25,.1,.25,1.3),.2s opacity cubic-bezier(.25,.1,.25,1.3)}:host(.mk-controls-container) .mk-popover-arrow path{stroke-width:1px}:host(.mk-controls-container) .mk-map-type-popover{width:241px;padding:20px 20px 0 20px}:host(.mk-controls-container) .mk-map-type-popover>div{width:67px;display:inline-block}:host(.mk-controls-container) .mk-map-type-label{margin-top:10px;margin-bottom:17px;text-align:center;font:13px/16px "-apple-system-font",HelveticaNeue-Medium,Helvetica,Arial,sans-serif}.mk-map-type-button-control{position:relative;cursor:pointer;width:65px;height:52px;border-radius:8px;overflow:hidden;margin:1px}.mk-map-type-button-control img{width:65px;height:52px}.mk-map-type-button-control::after{content:"";position:absolute;width:65px;height:52px;top:0;left:0}:host(.mk-controls-container) .mk-map-type-button-control img.mk-dark-icon,:host(.mk-controls-container.mk-color-scheme-dark) .mk-map-type-button-control img.mk-light-icon{display:none}:host(.mk-controls-container.mk-color-scheme-dark) .mk-map-type-button-control img.mk-dark-icon{display:inline}.mk-style-helper{opacity:0;pointer-events:none}.mk-rotation-control{width:48px;height:48px;cursor:-webkit-grab;cursor:grab;pointer-events:auto;border-radius:24px;overflow:hidden;line-height:0;transition:opacity .1s cubic-bezier(.19,1,.22,1)}.mk-rotation-control.mk-pressed{cursor:-webkit-grabbing;cursor:grabbing}@supports ((backdrop-filter:blur(30px)) or (-webkit-backdrop-filter:blur(30px))){.mk-focus .mk-zoom-in,.mk-focus .mk-zoom-out,.mk-legal-controls.mk-focus,.mk-pill-focus .mk-map-type-control,.mk-pill-focus .mk-user-location-control,.mk-pill-pressed .mk-map-type-control,.mk-pill-pressed .mk-user-location-control,.mk-pill-pressed .mk-zoom-in,.mk-pill-pressed .mk-zoom-out,.mk-rotation-control,.mk-top-right-controls-container:not(.mk-pill-pressed):not(.mk-pill-focus):not(:empty),.mk-zoom-controls:not(.mk-pill-pressed):not(.mk-focus){-webkit-backdrop-filter:blur(30px);backdrop-filter:blur(30px)}}.mk-rotation-control>.mk-rotation-wrapper{width:48px;height:48px;position:absolute;will-change:transform;overflow:hidden}.mk-rotation-control>.mk-rotation-wrapper>img{width:96px;height:96px;position:absolute}.mk-rotation-control.mk-focus>.mk-rotation-wrapper>img,.mk-rotation-control.mk-pressed>.mk-rotation-wrapper>img,.mk-rotation-control>.mk-rotation-wrapper:hover>img{left:-48px}:host(.mk-dark-mode) .mk-rotation-control>.mk-rotation-wrapper>img{top:-48px}.mk-rotation-control .mk-heading{font:15.5px "-apple-system-font",HelveticaNeue-Medium,Helvetica,Arial,sans-serif;font-weight:500;line-height:19px;position:absolute;top:14.5px;left:0;width:100%;overflow:hidden;text-overflow:clip;text-align:center;opacity:.55}.mk-rotation-control.mk-focus .mk-heading,.mk-rotation-control.mk-pressed .mk-heading,.mk-rotation-control:hover .mk-heading{opacity:.85}@media (hover:none){.mk-rotation-control:not(.mk-focus):not(.mk-pressed)>.mk-rotation-wrapper:hover{background-position-x:0}.mk-rotation-control:not(.mk-focus):not(.mk-pressed):hover .mk-heading{opacity:.55}}.mk-rotation-control .mk-rotation-slider{position:absolute;left:0;width:100%;height:15px;top:-30px}:host(.mk-controls-container.mk-dragging-annotation) .mk-legal-controls,:host(.mk-controls-container.mk-dragging-annotation) .mk-map-type-control,:host(.mk-controls-container.mk-dragging-annotation) .mk-rotation-control,:host(.mk-controls-container.mk-dragging-annotation) .mk-rotation-control input,:host(.mk-controls-container.mk-dragging-annotation) .mk-user-location-control,:host(.mk-controls-container.mk-dragging-annotation) .mk-zoom-in,:host(.mk-controls-container.mk-dragging-annotation) .mk-zoom-out{cursor:none}'
    },
    1020: t => {
      t.exports = ".mk-scale{position:absolute;top:0;left:0;vertical-align:top}:host(.mk-controls-container) .mk-popover{position:absolute;top:38px;right:-1px}:host(.mk-controls-container) .mk-popover-arrow{position:absolute;top:-13px}.mk-top-right-controls-container{position:absolute;top:9px;right:9px;direction:ltr}:host(.mk-controls-container:not(.mk-rtl)) .mk-top-right-controls-container .mk-control:first-child{border-top-left-radius:9px;border-bottom-left-radius:9px}:host(.mk-controls-container:not(.mk-rtl)) .mk-top-right-controls-container .mk-control:nth-last-child(2){border-top-right-radius:9px;border-bottom-right-radius:9px}:host(.mk-controls-container) .mk-pill-focus .mk-user-location-control{margin-right:1px}:host(.mk-controls-container) .mk-pill-focus .mk-map-type-control{margin-left:1px}:host(.mk-controls-container) .mk-popover.mk-user-location-error-popover{transform-origin:calc(100% - 69px) -12.416px}:host(.mk-controls-container) .mk-popover.mk-map-type-popover,:host(.mk-controls-container) .mk-popover.mk-user-location-error-popover:last-child{transform-origin:calc(100% - 24px) -12.416px}:host(.mk-controls-container) .mk-popover.mk-user-location-error-popover>.mk-popover-arrow{right:52.5px}:host(.mk-controls-container) .mk-popover.mk-map-type-popover>.mk-popover-arrow,:host(.mk-controls-container) .mk-popover.mk-user-location-error-popover:last-child>.mk-popover-arrow{right:10px}:host(.mk-controls-container) .mk-map-type-popover>div:not(:last-child){margin-right:20px}:host(.mk-rtl) .mk-top-right-controls-container{left:9px;right:auto;direction:rtl}:host(.mk-controls-container.mk-rtl) .mk-top-right-controls-container .mk-control:first-child{border-top-right-radius:9px;border-bottom-right-radius:9px}:host(.mk-controls-container.mk-rtl) .mk-top-right-controls-container .mk-control:nth-last-child(2){border-top-left-radius:9px;border-bottom-left-radius:9px}:host(.mk-controls-container.mk-rtl) .mk-pill-focus .mk-user-location-control{margin-left:1px;margin-right:0}:host(.mk-controls-container.mk-rtl) .mk-pill-focus .mk-map-type-control{margin-right:1px;margin-left:0}:host(.mk-controls-container.mk-rtl) .mk-popover{right:auto;left:-1px}:host(.mk-controls-container.mk-rtl) .mk-popover.mk-user-location-error-popover{transform-origin:69px -12.416px}:host(.mk-controls-container.mk-rtl) .mk-popover.mk-map-type-popover,:host(.mk-controls-container.mk-rtl) .mk-popover.mk-user-location-error-popover:last-child{transform-origin:24px -12.416px}:host(.mk-controls-container.mk-rtl) .mk-popover.mk-user-location-error-popover>.mk-popover-arrow{right:auto;left:52.5px}:host(.mk-controls-container.mk-rtl) .mk-popover.mk-map-type-popover>.mk-popover-arrow,:host(.mk-controls-container.mk-rtl) .mk-popover.mk-user-location-error-popover:last-child>.mk-popover-arrow{right:auto;left:10px}:host(.mk-controls-container.mk-rtl) .mk-map-type-popover>div:not(:last-child){margin-left:20px;margin-right:0}.mk-bottom-left-controls-container,.mk-bottom-right-controls-container{position:absolute;bottom:9px}.mk-rotation-control,.mk-zoom-controls{position:absolute;bottom:0}.mk-legal-controls,.mk-logo-control{position:absolute;bottom:-4px}.mk-bottom-right-controls-container{right:9px}.mk-bottom-left-controls-container{left:9px}:host(.mk-reduce-margin) .mk-bottom-right-controls-container{right:0}:host(.mk-reduce-margin) .mk-bottom-left-controls-container{left:4px}.mk-logo-control{left:0}:host(.mk-controls-container) div.mk-logo-control img.mk-logo.mk-logo-autonavi.mk-logo-autonavi{margin:0 0 -6px -9px}.mk-legal-controls,.mk-rotation-control,.mk-zoom-controls{right:0;left:auto}.mk-bottom-left-controls-container .mk-legal-controls{right:auto}.mk-zoom-controls .mk-zoom-in{border-top-right-radius:inherit;border-bottom-right-radius:inherit;right:0}.mk-zoom-controls .mk-zoom-out{border-top-left-radius:inherit;border-bottom-left-radius:inherit;left:0}.mk-rotation-control~.mk-legal-controls,.mk-rotation-control~.mk-zoom-controls,.mk-zoom-controls~.mk-legal-controls{right:57px;left:auto}.mk-bottom-left-controls-container .mk-legal-controls:nth-child(2){left:60px}.mk-rotation-control~.mk-zoom-controls~.mk-legal-controls{right:114px;left:auto}:host(.mk-rtl) .mk-bottom-right-controls-container{left:9px;right:auto}:host(.mk-rtl) .mk-bottom-left-controls-container{left:auto;right:9px}:host(.mk-rtl.mk-reduce-margin) .mk-bottom-right-controls-container{left:0;right:auto}:host(.mk-rtl.mk-reduce-margin) .mk-bottom-left-controls-container{left:auto;right:4px}:host(.mk-rtl) .mk-logo-control{left:auto;right:0}:host(.mk-rtl.mk-controls-container) div.mk-logo-control img.mk-logo.mk-logo-autonavi.mk-logo-autonavi{margin:0 -9px -6px 0}:host(.mk-rtl) .mk-zoom-controls .mk-zoom-in{border-top-left-radius:inherit;border-bottom-left-radius:inherit;border-top-right-radius:initial;border-bottom-right-radius:initial;right:auto;left:0}:host(.mk-rtl) .mk-zoom-controls .mk-zoom-out{border-top-left-radius:initial;border-bottom-left-radius:initial;border-top-right-radius:inherit;border-bottom-right-radius:inherit;right:0;left:auto}:host(.mk-rtl) .mk-legal-controls,:host(.mk-rtl) .mk-rotation-control,:host(.mk-rtl) .mk-zoom-controls{left:0;right:auto}:host(.mk-rtl) .mk-bottom-left-controls-container .mk-legal-controls{left:auto}:host(.mk-rtl) .mk-rotation-control~.mk-legal-controls,:host(.mk-rtl) .mk-rotation-control~.mk-zoom-controls,:host(.mk-rtl) .mk-zoom-controls~.mk-legal-controls{left:57px;right:auto}:host(.mk-rtl) .mk-bottom-left-controls-container .mk-legal-controls:nth-child(2){right:60px}:host(.mk-rtl) .mk-rotation-control~.mk-zoom-controls~.mk-legal-controls{left:114px;right:auto}"
    },
    4438: (t, e, i) => {
      var n = i(3658),
        o = i(8961),
        s = i(2114),
        r = i(270).Node,
        a = i(1232);

      function l(t) {
        r.call(this, t), this.classList.add(h.CONTROL)
      }
      var h = {
        CONTROL: "mk-control",
        DISABLED: "mk-disabled",
        FOCUS: "mk-focus"
      };

      function c(t) {
        this._control = t
      }

      function d(t) {
        this._control = t
      }

      function u(t) {
        this._control = t
      }
      l.prototype = s.inheritPrototype(r, l, {
        constructor: l,
        _enabled: !1,
        hasFocus: !1,
        pageHasFocus: !1,
        get enabled() {
          return this._enabled
        },
        set enabled(t) {
          var e = !!t;
          this._enabled !== e && (e ? this.enable() : this.disable(), this._enabled = e, this.reset())
        },
        set canShowTooltips(t) {
          t ? this._updateLabels() : this._clearLabels()
        },
        willMoveToParent: function (t) {
          t ? this.parent || (this._createListeners(), a.addEventListener(a.Events.LocaleChanged, this._eventListener), this.enabled && (this._addFocusAndBlurListeners(), this._addKeyboardListeners(), this.addEventListeners())) : (a.removeEventListener(a.Events.LocaleChanged, this._eventListener), this.removeEventListeners(), this._removeFocusAndBlurListeners(), this._removeKeyboardListeners(), this._destroyListeners())
        },
        enable: function () {
          this.classList.remove(h.DISABLED), this._createListeners(), this.element.addEventListener(n.startEventType, this._eventListener), this.element.addEventListener("click", this._eventListener), this.parent && (this._addFocusAndBlurListeners(), this._addKeyboardListeners(), this.addEventListeners())
        },
        disable: function () {
          this.classList.add(h.DISABLED), this.element.removeEventListener(n.startEventType, this._eventListener), this.element.removeEventListener("click", this._eventListener), this.removeEventListeners(), this._removeFocusAndBlurListeners(), this._removeKeyboardListeners()
        },
        blurFocusedElement: function (t) {
          var e = n.getShadowDOMTargetFromEvent(this.element, t);
          if (!this.element.contains(e)) {
            var i = n.containingDocumentOrShadowRoot(this.element);
            i.activeElement && this.element.contains(i.activeElement) && i.activeElement.blur()
          }
        },
        reset: function () { },
        saveEndEventProps: function (t) {
          if (t && t.type === n.endEventType) {
            var e = t.changedTouches ? t.changedTouches[0] : t;
            this._endEventProps = [e.clientX, e.clientY, e.screenX, e.screenY]
          }
        },
        checkClickEventProps: function (t) {
          if (!this._endEventProps) return !1;
          for (var e = [t.clientX, t.clientY, t.screenX, t.screenY], i = !0, n = 0; n < e.length; n++)
            if (Math.abs(this._endEventProps[n] - e[n]) > 1) {
              i = !1;
              break
            } return delete this._endEventProps, i
        },
        clicked: function () { },
        touchesBegan: function (t) { },
        touchesMoved: function (t) { },
        touchesEnded: function (t) { },
        touchesCanceled: function (t) { },
        spaceBarKeyDown: function (t) { },
        spaceBarKeyUp: function (t) { },
        escapeKeyDown: function (t) { },
        escapeKeyUp: function (t) { },
        downArrowKeyUp: function (t) { },
        downArrowKeyDown: function (t) { },
        upArrowKeyUp: function (t) { },
        upArrowKeyDown: function (t) { },
        rightArrowKeyUp: function (t) { },
        leftArrowKeyUp: function (t) { },
        rightArrowKeyDown: function (t) { },
        leftArrowKeyDown: function (t) { },
        focused: function (t) { },
        blurred: function (t) { },
        pageDidFocus: function (t) { },
        pageDidBlur: function (t) { },
        updateTintColor: function (t) { },
        removeEventListeners: function () { },
        addEventListeners: function () { },
        localeChanged: function () { },
        _clearLabels: function () {
          n.updateLabel(this.element, "")
        },
        _createListeners: function () {
          this._eventListener || (this._eventListener = new c(this)), this._windowEventListener || (this._windowEventListener = new u(this)), this._cancelFocusEventListener || (this._cancelFocusEventListener = new d(this))
        },
        _destroyListeners: function () {
          this._eventListener && (this.element.removeEventListener(n.startEventType, this._eventListener), this.element.removeEventListener("click", this._eventListener), this._eventListener.destroy(), delete this._eventListener), this._windowEventListener && (this._windowEventListener.destroy(), delete this._windowEventListener), this._cancelFocusEventListener && (this._cancelFocusEventListener.destroy(), delete this._cancelFocusEventListener)
        },
        _addFocusAndBlurListeners: function () {
          this.element.addEventListener("focus", this._eventListener, !0), this.element.addEventListener("blur", this._eventListener, !0), window.addEventListener("focus", this._windowEventListener), window.addEventListener("blur", this._windowEventListener), this.hasFocus = n.containingDocumentOrShadowRoot(this.element).activeElement === this.element
        },
        _removeFocusAndBlurListeners: function () {
          this.element.removeEventListener("focus", this._eventListener, !0), this.element.removeEventListener("blur", this._eventListener, !0), window.removeEventListener(n.startEventType, this._cancelFocusEventListener, !0), window.removeEventListener("focus", this._windowEventListener), window.removeEventListener("blur", this._windowEventListener)
        },
        _addKeyboardListeners: function () {
          this.element.addEventListener("keydown", this._eventListener), this.element.addEventListener("keyup", this._eventListener)
        },
        _removeKeyboardListeners: function () {
          this.element.removeEventListener("keydown", this._eventListener), this.element.removeEventListener("keyup", this._eventListener)
        }
      }), o.EventTarget(l.prototype), c.prototype = {
        destroy: function () {
          window.removeEventListener(n.startEventType, this._control._cancelFocusEventListener, !0), this._removeEventListeners(), delete this._control
        },
        handleEvent: function (t) {
          switch (t.type) {
            case "click":
              this._click(t);
              break;
            case n.startEventType:
              this._touchesBegan(t);
              break;
            case n.moveEventType:
              this._control.touchesMoved(t);
              break;
            case n.endEventType:
              this._removeEventListeners(), this._control.touchesEnded(t);
              break;
            case n.cancelEventType:
              this._removeEventListeners(), this._control.touchesCanceled(t);
              break;
            case "keydown":
              this._keyDown(t);
              break;
            case "keyup":
              this._keyUp(t);
              break;
            case "focus":
              this._focus(t);
              break;
            case "blur":
              this._blur(t);
              break;
            case a.Events.LocaleChanged:
              this._control.localeChanged(t)
          }
        },
        _click: function (t) {
          this._swallowEvent(t), this._control.clicked(t)
        },
        _touchesBegan: function (t) {
          this._swallowEvent(t), ("mousedown" === t.type || "pointerdown" === t.type && "mouse" === t.pointerType) && (0 !== t.button || t.ctrlKey) || (window.addEventListener(n.moveEventType, this, !0), window.addEventListener(n.endEventType, this, !0), n.cancelEventType && window.addEventListener(n.cancelEventType, this, !0), this._control.touchesBegan(t))
        },
        _keyDown: function (t) {
          switch (t.keyCode) {
            case s.KeyCodes.Escape:
              this._control.escapeKeyDown(t);
              break;
            case s.KeyCodes.SpaceBar:
              t.preventDefault(), this._control.spaceBarKeyDown(t);
              break;
            case s.KeyCodes.DownArrow:
              t.preventDefault(), this._control.downArrowKeyDown(t);
              break;
            case s.KeyCodes.UpArrow:
              t.preventDefault(), this._control.upArrowKeyDown(t);
              break;
            case s.KeyCodes.RightArrow:
              t.preventDefault(), this._control.rightArrowKeyDown(t);
              break;
            case s.KeyCodes.LeftArrow:
              t.preventDefault(), this._control.leftArrowKeyDown(t)
          }
        },
        _keyUp: function (t) {
          switch (t.keyCode) {
            case s.KeyCodes.Escape:
              this._control.escapeKeyUp(t);
              break;
            case s.KeyCodes.DownArrow:
              t.preventDefault(), this._control.downArrowKeyUp(t);
              break;
            case s.KeyCodes.UpArrow:
              t.preventDefault(), this._control.upArrowKeyUp(t);
              break;
            case s.KeyCodes.RightArrow:
              t.preventDefault(), this._control.rightArrowKeyUp(t);
              break;
            case s.KeyCodes.LeftArrow:
              t.preventDefault(), this._control.leftArrowKeyUp(t);
              break;
            case s.KeyCodes.SpaceBar:
              t.preventDefault(), this._control.spaceBarKeyUp(t)
          }
        },
        _focus: function (t) {
          this._control.hasFocus || n.containingDocumentOrShadowRoot(this._control.element).activeElement === t.target && (this._control.hasFocus = !0, this._control.classList.add(h.FOCUS), window.addEventListener(n.startEventType, this._control._cancelFocusEventListener, !0), this._control.focused(t))
        },
        _blur: function (t) {
          this._control.hasFocus && (this._control.hasFocus = !1, window.removeEventListener(n.startEventType, this._control._cancelFocusEventListener, !0), this._control.classList.remove(h.FOCUS), this._control.blurred(t))
        },
        _removeEventListeners: function () {
          window.removeEventListener(n.moveEventType, this, !0), window.removeEventListener(n.endEventType, this, !0), n.cancelEventType && window.removeEventListener(n.cancelEventType, this, !0)
        },
        _swallowEvent: function (t) {
          t.preventDefault(), t.stopPropagation()
        }
      }, d.prototype = {
        destroy: function () {
          delete this._control
        },
        handleEvent: function (t) {
          this._control.blurFocusedElement(t)
        }
      }, u.prototype = {
        destroy: function () {
          delete this._control
        },
        handleEvent: function (t) {
          switch (t.type) {
            case "focus":
              this._control.pageHasFocus || (this._control.pageHasFocus = !0, this._control.pageDidFocus(t));
              break;
            case "blur":
              this._control.pageHasFocus = !1, this._control.pageDidBlur(t)
          }
        }
      }, t.exports = l
    },
    3770: (t, e, i) => {
      var n = i(3032),
        o = i(2114),
        s = i(3658),
        r = i(5271),
        a = i(6307),
        l = i(6530),
        h = i(1887),
        c = i(3141),
        d = i(2979),
        u = i(9561),
        p = i(210),
        m = i(270),
        g = i(270).Node,
        _ = i(5211),
        f = i(1232),
        y = i(1593),
        v = i(975),
        w = v.FeatureVisibility,
        b = ["ca-ES", "en-GB", "en-US", "es-ES", "es-MX", "hi-IN", "id-ID", "ja-JP", "ko-KR", "ms-MY", "nb-NO", "pt-BR", "pt-PT", "ro-RO", "zh-CN", "zh-HK", "zh-TW"],
        C = "mk-rtl",
        k = "mk-with-zoom-control",
        S = "mk-pill-focus",
        M = "mk-pill-pressed",
        E = new p(7, 11);

      function L(t) {
        g.call(this, s.htmlElement("div", {
          class: "mk-controls-container"
        })), this._map = t, this._topRightControlsNode = new g(s.htmlElement("div", {
          class: "mk-top-right-controls-container"
        })), this._bottomRightControlsNode = new g(s.htmlElement("div", {
          class: "mk-bottom-right-controls-container"
        })), this._bottomLeftControlsNode = new g(s.htmlElement("div", {
          class: "mk-bottom-left-controls-container"
        })), this._setPendingControls(), this._shadowRootNode = s.addShadowRootChild(this, i(2713) + i(295) + i(1020)), this._shadowRootNode.addChild(this._topRightControlsNode), this._shadowRootNode.addChild(this._bottomRightControlsNode), this._shadowRootNode.addChild(this._bottomLeftControlsNode), this._logo = new r, this._legalControl = new a, n.addEventListener(n.Events.Changed, this), f.activeLocale && (this._rtl = f.activeLocale.rtl, this.classList.toggle(C, this._rtl)), f.addEventListener(f.Events.LocaleChanged, this)
      }

      function T() {
        return n.isAutoNavi || n.showMapsLogo
      }
      L.prototype = o.inheritPrototype(g, L, {
        _rtl: !1,
        get controlsPending() {
          return this._controlsPending
        },
        set canShowTooltips(t) {
          this._userLocationControl && (this._userLocationControl.canShowTooltips = t), this._zoomControl && (this._zoomControl.canShowTooltips = t), this._mapTypeControl && (this._mapTypeControl.canShowTooltips = t), this._rotationControl && (this._rotationControl.canShowTooltips = t)
        },
        mapPaddingDidChange: function (t) {
          var e = this.element.style;
          e.top = t.top + "px", e.left = t.left + "px", e.bottom = t.bottom + "px", e.right = t.right + "px", this.sizeDidChange()
        },
        sizeDidChange: function () {
          var t = this._shouldHideControls();
          this._toggleControl(this._map.showsZoomControl && !t, this._zoomControl, this.updateZoomControl), this._toggleControl(this._map.showsMapTypeControl && !t, this._mapTypeControl, this.updateMapTypeControl), this._toggleControl(this._map.showsUserLocationControl && !t, this._userLocationControl, this.updateUserLocationControl), this.updateLogo(), this.updateLegalControl(), this.updateRotationControl(), this.updateScale(), this.zoomLevelDidChange(), this._setReduceMargin()
        },
        zoomLevelDidChange: function () {
          if (this._zoomControl) {
            var t = this._map.minZoomLevel,
              e = this._map.maxZoomLevel;
            this._map.snapsToIntegralZoomLevels && (t = Math.ceil(t), e = Math.floor(e)), this._zoomControl.zoomOutEnabled = this._map.zoomLevel > t, this._zoomControl.zoomInEnabled = this._map.zoomLevel < e
          }
        },
        update: function () {
          this._map && (this.classList.toggle("mk-color-scheme-dark", s.darkColorScheme(this._map.colorScheme)), this.classList.toggle("mk-dark-mode", s.darkColorScheme(this._map.tint)), this._shouldHideControls() ? (this._removeZoomControl(), this._removeMapTypeControl(), this._removeUserLocationControl(), this._removeRotationControl(), this._removeScale()) : (this.updateZoomControl(), this.updateMapTypeControl(), this.updateUserLocationControl(), this.updateRotationControl(), this.updateScale()), this.updateLogo(), this.updateLegalControl(), this._setReduceMargin())
        },
        scaleDidChange: function () {
          this._scale && (this._scale.update(), this._scale.hideIfNeeded())
        },
        updateScale: function () {
          this._map.showsScale === w.Hidden || this._shouldHideControls() ? this._removeScale() : (this._addScale(), this._scale.node.mapWidth = this._map._mapNode.size.width, this._scale.updateTheme(this._map.mapNodeTint), this._positionScale(), this._scale.update())
        },
        updateZoomControl: function () {
          this._map.showsZoomControl && !this._shouldHideControls() ? (this._addZoomControl(), this._zoomControl.enabled = this._map.isZoomEnabled, this.zoomLevelDidChange(), this._zoomControl.updateTintColor(this._map.tintColorForControls)) : this._removeZoomControl()
        },
        updateMapTypeControl: function () {
          this._map.showsMapTypeControl && !this._shouldHideControls() ? (this._addMapTypeControl(), this._mapTypeControl.mapType = this._map.mapType, this._mapTypeControl.enabled = !0, this._mapTypeControl.updateTintColor(this._map.tintColorForControls)) : this._removeMapTypeControl()
        },
        updateUserLocationControl: function () {
          if (this._map.showsUserLocationControl && !this._shouldHideControls()) {
            switch (this._addUserLocationControl(), this._userLocationControl.enabled = !0, this._userLocationControl.state) {
              case d.States.Default:
                _.isAvailable ? this._map.tracksUserLocation && _ && _.location ? this._userLocationControl.toTrackingState() : (this._map.tracksUserLocation || this._map.showsUserLocation && !this._map.userLocationAnnotation) && this._userLocationControl.toWaitingState() : this._userLocationControl.toDisabledState();
                break;
              case d.States.Waiting:
                _ && _.location && this.userLocationDidChange(_), this._map.showsUserLocation || this._userLocationControl.toDefaultState();
                break;
              case d.States.Tracking:
                this._map.tracksUserLocation || this._userLocationControl.toDefaultState()
            }
            this._userLocationControl.updateTintColor(this._map.tintColorForControls)
          } else this._removeUserLocationControl()
        },
        updateRotationControl: function () {
          this._shouldHideControls() || this._map.isCompassHidden ? this._removeRotationControl() : (this._addRotationControl(), this._rotationControl.rotation = this._map.rotation, this._rotationControl.updateImage(s.devicePixelRatio, s.darkColorScheme(this._map.mapNodeTint)), this._rotationControl.updateTintColor(this._map.tintColorForControls))
        },
        updateLegalControl: function () {
          this._addAndUpdateLegalControl()
        },
        updateLogo: function () {
          !this._shouldHideLogo() && T() ? this._addAndUpdateLogo() : this._logo.remove(), this._legalControl.updateWithMapTypeAndTint(this._map.mapType, this._map.mapNodeTint)
        },
        devicePixelRatioDidChange: function () {
          this._rotationControl && this._rotationControl.updateImage(s.devicePixelRatio, s.darkColorScheme(this._map.mapNodeTint)), this._scale && this._scale.update(), this._logo.updateWithMapNodeTint(this._map.mapNodeTint)
        },
        handleEvent: function (t) {
          if (this._map) switch (t.type) {
            case l.EVENTS.MAP_TYPE_CHANGE:
              this._mapTypeControl && (this._map.mapType = this._mapTypeControl.mapType);
              break;
            case d.EVENTS.PRESSED:
              this._userLocationControl.state === d.States.Waiting ? this._map.tracksUserLocation = !0 : this._userLocationControl.state !== d.States.Tracking && (this._map.tracksUserLocation = !1);
              break;
            case f.Events.LocaleChanged:
              this._handleLocaleChanged(t);
              break;
            case "update":
              this._unsetPendingControls(), this._map.addWaitingAnnotations();
              break;
            case n.Events.Changed:
              this.updateLogo(), this.updateLegalControl()
          }
        },
        mapWasDestroyed: function () {
          this._unsetPendingControls(), f.removeEventListener(f.Events.LocaleChanged, this), n.removeEventListener(n.Events.Changed, this), this._destroyZoomControl(), this._destroyMapTypeControl(), this._destroyUserLocationControl(), this._destroyRotationControl(!0), this._legalControl.remove(), delete this._legalControl, this._logo.mapWasDestroyed(), this._logo.remove(), delete this._logo, this._removeScale(), this.remove(), delete this._map
        },
        userLocationDidChange: function (t) {
          this._userLocationControl && (this._map.tracksUserLocation ? this._userLocationControl.toTrackingState() : this._userLocationControl.toDefaultState())
        },
        userLocationDidError: function (t) {
          this._userLocationControl && this._userLocationControl.toDisabledState(), this._map.userLocationAnnotation || 3 === t.errorCode || (this._map.showsUserLocation = !1)
        },
        _handleLocaleChanged: function (t) {
          this.classList.toggle(C, t.locale.rtl), this._rtl !== t.locale.rtl ? (this._rtl = t.locale.rtl, this._rtlChanged = !0, this.update(), this._rtlChanged = !1) : this.updateLogo()
        },
        _addScale: function () {
          this._scale || (this._setPendingControls(), this._scale = new h(this._map), this._shadowRootNode.addChild(this._scale, 0))
        },
        _positionScale: function () {
          var t = this._map.ensureVisibleFrame().size,
            e = !this._rtl;
          this._scale.node.leftAligned = e, this._scale.position = new p(e ? E.x : t.width - this._scale.size.width - E.x, E.y), this._scale.shouldDisplayScale || this._scale.node.setOpacityAnimated(0, !1)
        },
        _removeScale: function () {
          this._scale && (this._setPendingControls(), this._scale.node.l10n = null, this._scale.node.remove(), this._scale.scene.destroy(), this._scale.remove(), delete this._scale)
        },
        _addZoomControl: function () {
          !this._map.showsZoomControl || this._zoomControl || this._shouldHideControls() || (this._setPendingControls(), this._zoomControl = new c, this._zoomControl.enabled = this._map.isZoomEnabled, this._zoomControl.addEventListener(c.EVENTS.ZOOM_START, this._map), this._zoomControl.addEventListener(c.EVENTS.ZOOM_END, this._map), this._bottomRightControlsNode.insertBefore(this._zoomControl, this._legalControl), this._rotationControl && this._rotationControl.classList.add(k))
        },
        _removeZoomControl: function () {
          !this._shouldHideControls() && this._map.showsZoomControl || !this._zoomControl || (this._setPendingControls(), this._zoomControl.enabled = !1, this._destroyZoomControl())
        },
        _destroyZoomControl: function () {
          this._zoomControl && (this._zoomControl.removeEventListener(c.EVENTS.ZOOM_START, this._map), this._zoomControl.removeEventListener(c.EVENTS.ZOOM_END, this._map), this._zoomControl.remove(), this._rotationControl && this._rotationControl.classList.remove(k), delete this._zoomControl)
        },
        _addMapTypeControl: function () {
          !this._map.showsMapTypeControl || this._mapTypeControl || this._shouldHideControls() || (this._setPendingControls(), this._mapTypeControl = new l(i(3188).MapTypes, this._map.mapType, this), this._mapTypeControl.addEventListener(l.EVENTS.MAP_TYPE_CHANGE, this), this._topRightControlsNode.addChild(this._mapTypeControl))
        },
        _removeMapTypeControl: function () {
          this._mapTypeControl && (this._setPendingControls(), this._mapTypeControl.enabled = !1, this._destroyMapTypeControl())
        },
        _destroyMapTypeControl: function () {
          this._mapTypeControl && (this._mapTypeControl.removeEventListener(l.EVENTS.MAP_TYPE_CHANGE, this), this._mapTypeControl.remove(), delete this._mapTypeControl)
        },
        _toggleControl: function (t, e, i) {
          (e && !t || !e && t) && i.call(this)
        },
        _shouldHideControls: function () {
          if (!n.ready) return !0;
          var t = this._map.ensureVisibleFrame().size;
          return t.width < v.MapSizes.minimumSizeToShowControls.width || t.height < v.MapSizes.minimumSizeToShowControls.height
        },
        _shouldHideLogo: function () {
          if (!n.ready) return !0;
          var t = -1 === b.indexOf(f.localeId) ? v.MapSizes.minimumSizeToShowLogo : v.MapSizes.minimumSizeToShowLogoWithReducedMargin,
            e = this._map.ensureVisibleFrame().size;
          return e.width < t.width || e.height < t.height
        },
        _addRotationControl: function () {
          this._shouldHideControls() || this._rotationControl || (this._setPendingControls(), this._rotationControl = new u(this._map), this._rotationControl.enabled = !0, this._bottomRightControlsNode.insertBefore(this._rotationControl, this._zoomControl || this._legalControl), this._zoomControl && this._rotationControl.classList.add(k))
        },
        _removeRotationControl: function () {
          this._rotationControl && (this._setPendingControls(), this._destroyRotationControl())
        },
        _destroyRotationControl: function (t) {
          if (this._rotationControl) {
            if (t) this._rotationControl.mapWasDestroyed(), this._rotationControl.remove();
            else {
              var e = this._rotationControl;
              e.opacity = 0;
              var i = setTimeout(n, 300);
              e.element.addEventListener("transitionend", n)
            }
            delete this._rotationControl
          }

          function n() {
            clearTimeout(i), e.element.removeEventListener("transitionend", n), e.mapWasDestroyed(), e.remove()
          }
        },
        _addUserLocationControl: function () {
          !this._map.showsUserLocationControl || this._userLocationControl || this._shouldHideControls() || (this._setPendingControls(), this._userLocationControl = new d(this._map, this._rtl, this), this._userLocationControl.addEventListener(d.EVENTS.PRESSED, this), this._topRightControlsNode.insertBefore(this._userLocationControl, this._mapTypeControl))
        },
        controlDidGetFocus: function (t) {
          this._toggleParentClass(t, S, !0)
        },
        controlDidLoseFocus: function (t) {
          this._toggleParentClass(t, S, !1)
        },
        controlWasPressed: function (t) {
          this._toggleParentClass(t, M, !0)
        },
        controlWasReleased: function (t) {
          this._toggleParentClass(t, M, !1)
        },
        _toggleParentClass: function (t, e, i) {
          var n = t.parent;
          n === this._topRightControlsNode && n.classList.toggle(e, i)
        },
        _removeUserLocationControl: function () {
          !this._shouldHideControls() && this._map.showsUserLocationControl || !this._userLocationControl || (this._setPendingControls(), this._destroyUserLocationControl())
        },
        _destroyUserLocationControl: function () {
          this._userLocationControl && (this._userLocationControl.removeEventListener(d.EVENTS.STATE_CHANGE, this._map), this._userLocationControl.mapWasDestroyed(), this._userLocationControl.remove(), delete this._userLocationControl)
        },
        _addAndUpdateLegalControl: function () {
          this._setPendingControls(), (!n.showMapsLogo && n.mirrorLegalLink ? this._bottomLeftControlsNode : this._bottomRightControlsNode).addChild(this._legalControl), this._legalControl.updateWithMapTypeAndTint(this._map.mapType, this._map.mapNodeTint)
        },
        _addAndUpdateLogo: function () {
          this._logo.parent || (this._setPendingControls(), this._bottomLeftControlsNode.insertBefore(this._logo, this._legalControl)), this._logo.updateWithMapNodeTint(this._map.mapNodeTint)
        },
        _setPendingControls: function () {
          this._controlsPending = !0, m.addEventListener("update", this)
        },
        _unsetPendingControls: function () {
          this._controlsPending = !1, m.removeEventListener("update", this)
        },
        _setReduceMargin: function () {
          var t = this._map.ensureVisibleFrame().size.width,
            e = v.MapSizes,
            i = e.minimumSizeToShowLogo.width,
            n = e.minimumSizeToShowControls.width;
          this.classList.toggle("mk-reduce-margin", t < i && T()), this.classList.toggle("mk-reduced-vertical-margin", t < n)
        },
        controlBounds: function () {
          var t = [];
          return [this._topRightControlsNode, this._bottomLeftControlsNode, this._bottomRightControlsNode].forEach((function (e) {
            0 !== e.children.length && (e === this._bottomRightControlsNode ? Array.prototype.push.apply(t, e.children) : t.push(e))
          }), this), t.map((function (t) {
            try {
              var e = t.element.getBoundingClientRect(),
                i = window.getComputedStyle(this._map.element);
              if ("none" === (i.transform || i.msTransform || i.webkitTransform)) {
                var n = this._map.element.getBoundingClientRect();
                return new y(e.left - n.left, e.top - n.top, e.width, e.height)
              }
              return y.rectFromClientRect(e)
            } catch (t) {
              return new y
            }
          }), this)
        }
      }), t.exports = L
    },
    6307: (t, e, i) => {
      var n = i(3658),
        o = i(2114),
        s = i(3032),
        r = i(4438),
        a = i(1232),
        l = i(270).Node;
      t.exports = p;
      var h = "mk-legal-controls",
        c = "mk-legal-controls-autonavi",
        d = "mk-legal",
        u = "mk-legal-satellite";

      function p() {
        var t = n.htmlElement("a", {
          target: "_blank",
          tabindex: 0
        });
        r.call(this, t), this.classList.add(h), this._elLegal = n.htmlElement("span"), this._elLegal.textContent = a.get("Legal.Label"), this._elLegalNode = new l(this._elLegal), this._elLegalNode.classList.add(d), t.appendChild(this._elLegal), this.enabled = !0
      }
      p.prototype = o.inheritPrototype(r, p, {
        _attributionUrl: "",
        updateWithMapTypeAndTint: function (t, e) {
          if (this.mapType = t, this.tint = e, this.classList.toggle(c, s.isAutoNavi), this._elLegalNode.classList.toggle(u, n.darkColorScheme(e)), this._elLegal.textContent = a.get("Legal.Label"), s.isAutoNavi)
            if (s.ready) {
              var i = s.types[this.mapType].tileSources[0];
              i.attribution && i.attribution.url && (this._attributionUrl = this.element.href = i.attribution.url)
            } else this._attributionUrl = this.element.href = "";
          else this._attributionUrl = this.element.href = a.get("Legal.Apple.URL")
        },
        localeChanged: function (t) {
          this.mapType && this.updateWithMapTypeAndTint(this.mapType, this.tint)
        },
        clicked: function (t) {
          this._pressed(t)
        },
        spaceBarKeyUp: function (t) {
          this._pressed(t)
        },
        _pressed: function (t) {
          this._attributionUrl && window.open(this._attributionUrl)
        }
      })
    },
    5271: (t, e, i) => {
      var n = i(3658),
        o = i(2114),
        s = i(3032),
        r = i(2640),
        a = i(270).Node,
        l = i(1232);
      i(8006).Tints;
      t.exports = d;
      var h = "satellite",
        c = "autonavi";

      function d() {
        this._logoElement = n.htmlElement("img"), this._logoElementNode = new a(this._logoElement), this._logoElementNode.classList.add(u.LOGO), a.call(this, n.htmlElement("div", {
          class: u.CONTROL
        }, this._logoElement)), l.addEventListener(l.Events.LocaleChanged, this), s.addEventListener(s.Events.Changed, this), this.rtl = l.activeLocale.rtl
      }
      var u = {
        CONTROL: "mk-logo-control",
        LOGO: "mk-logo",
        LOGO_AUTONAVI: "mk-logo-autonavi"
      };

      function p(t, e, i) {
        t.classList.toggle(u.LOGO_AUTONAVI, s.isAutoNavi), t.element.crossOrigin = n.getCorsAttribute(s.distUrlWithCredentials), t.setAttribute("src", function (t, e) {
          var i = [r.createImageUrl("logos/logo-wordmark")],
            o = ".svg",
            a = [1];
          s.isAutoNavi ? (i = [r.createImageUrl("logos/logo"), c], o = ".png", a = [1, 2, 3]) : 1 === n.devicePixelRatio && (o = ".png");
          t && i.push(h);
          s.isAutoNavi && e && i.push("rtl");
          s.isAutoNavi || i.push(l.localeId);
          return n.imagePathForDevice(a, i.join("-"), o)
        }(e, i))
      }
      d.prototype = o.inheritPrototype(a, d, {
        tint: void 0,
        updateWithMapNodeTint: function (t) {
          this.tint = t;
          var e = n.darkColorScheme(t),
            i = this._logoElementNode;
          s.state === s.States.UNINITIALIZED ? s.addEventListener(s.Events.Initialized, (function t() {
            s.removeEventListener(s.Events.Initialized, t), p(i, e, this.rtl)
          })) : p(i, e, this.rtl), i.setAttribute("alt", l.get("Logo." + s.tileProvider + ".Tooltip"))
        },
        handleEvent: function (t) {
          switch (t.type) {
            case l.Events.LocaleChanged:
              this.rtl = t.locale.rtl, this._handleLocaleChange(t);
              break;
            case s.Events.Changed:
              if (!this.tint) return void 0;
              this.updateWithMapNodeTint(this.tint)
          }
        },
        mapWasDestroyed: function () {
          l.removeEventListener(l.Events.LocaleChanged, this), s.removeEventListener(s.Events.Changed, this)
        },
        _handleLocaleChange: function (t) {
          this.tint && this.updateWithMapNodeTint(this.tint)
        }
      })
    },
    6430: (t, e, i) => {
      var n = i(3658),
        o = i(2114),
        s = i(4438),
        r = i(1232),
        a = i(2640),
        l = i(3032);

      function h(t, e) {
        this.delegate = e, this.mapType = t, this.enabled = !1;
        var i = e.mapTypes[t] === e.mapType,
          o = r.get("Mode." + t);
        s.call(this, n.htmlElement("div", {
          class: c.CONTROL + (i ? " " + c.SELECTED : ""),
          role: "radio",
          "aria-checked": i,
          "aria-label": o,
          tabindex: 0,
          title: o
        }));
        var a = function (t, e) {
          var i = [];
          e[t] === e.Standard ? (i.push(n.htmlElement("img", {
            class: c.LIGHT_ICON,
            role: "presentation",
            crossOrigin: n.getCorsAttribute(l.distUrlWithCredentials),
            src: d(t, !1)
          })), i.push(n.htmlElement("img", {
            class: c.DARK_ICON,
            role: "presentation",
            crossOrigin: n.getCorsAttribute(l.distUrlWithCredentials),
            src: d(t, !0)
          }))) : i.push(n.htmlElement("img", {
            role: "presentation",
            crossOrigin: n.getCorsAttribute(l.distUrlWithCredentials),
            src: d(t, !1)
          }));
          return i
        }(t, e.mapTypes);
        a.forEach(function (t) {
          this.element.appendChild(t)
        }.bind(this))
      }
      var c = {
        CONTROL: "mk-map-type-button-control",
        PRESSED: "mk-pressed",
        SELECTED: "mk-selected",
        LIGHT_ICON: "mk-light-icon",
        DARK_ICON: "mk-dark-icon"
      };

      function d(t, e) {
        var i = [a.createImageUrl("icons/map-type")];
        return i.push(t.toLowerCase()), e && i.push("dark"), n.imagePathForDevice([1, 2], i.join("-"), ".png")
      }
      h.prototype = o.inheritPrototype(s, h, {
        setSelected: function (t) {
          this.classList.toggle(c.SELECTED, t), this.setAttribute("aria-checked", t)
        },
        reset: function () {
          this.classList.remove(c.PRESSED)
        },
        localeChanged: function (t) {
          var e = r.get("Mode." + this.mapType);
          this.setAttribute("title", e), this.setAttribute("aria-label", e)
        },
        touchesBegan: function (t) {
          this._pressed()
        },
        touchesEnded: function (t) {
          this.reset()
        },
        clicked: function () {
          this._select()
        },
        touchesCanceled: function (t) {
          this.reset()
        },
        spaceBarKeyDown: function (t) {
          this._pressed()
        },
        spaceBarKeyUp: function (t) {
          this.reset(), this._select()
        },
        blurFocusedElement: function () { },
        _pressed: function () {
          this.classList.add(c.PRESSED)
        },
        _select: function () {
          this.delegate.mapType = this.delegate.mapTypes[this.mapType]
        }
      }), t.exports = h
    },
    6530: (t, e, i) => {
      var n = i(3658),
        o = i(8961),
        s = i(2114),
        r = i(4438),
        a = i(1232),
        l = i(5819);
      t.exports = d;
      var h = "data-l10n-key";

      function c(t) {
        this._control = t
      }

      function d(t, e, i) {
        r.call(this, n.htmlElement("div", {
          role: "button",
          tabindex: "0"
        })), this.classList.add(u.CONTROL), this._delegate = new c(this), this._focusDelegate = i;
        var o, s = (o = n.svgElement("path"), [n.createSVGIcon(o, {
          width: 45,
          height: 24
        }), o]);
        this.element.appendChild(s[0]), this._iconElement = s[1], this._mapType = e, this._mapTypes = t, this._updateIcon(), this._updateLabels(), this.enabled = !0, this._isOpen = !1
      }
      c.prototype = {
        constructor: c,
        get mapTypes() {
          return this._control.mapTypes
        },
        get mapType() {
          return this._control.mapType
        },
        set mapType(t) {
          this._control.mapType = t
        }
      };
      var u = {
        CONTROL: "mk-map-type-control",
        PRESSED: "mk-pressed"
      };
      d.EVENTS = {
        MAP_TYPE_CHANGE: "map-type-change"
      }, d.prototype = s.inheritPrototype(r, d, {
        get mapType() {
          return this._mapType
        },
        set mapType(t) {
          t !== this._mapType && (this._mapType = t, this._updateIcon(), this.popover.updateSelected(), this.dispatchEvent(new o.Event(d.EVENTS.MAP_TYPE_CHANGE)))
        },
        get mapTypes() {
          return this._mapTypes
        },
        localeChanged: function (t) {
          this._updateLabels(), this.popover.updateLabels()
        },
        touchesBegan: function (t) {
          this._pressed()
        },
        touchesEnded: function (t) {
          this.reset()
        },
        clicked: function (t) {
          this._toggle(!1)
        },
        touchesCanceled: function (t) {
          this.reset()
        },
        spaceBarKeyDown: function (t) {
          this._pressed()
        },
        spaceBarKeyUp: function (t) {
          this.reset(), this._open(!0)
        },
        updateTintColor: function (t) {
          this.tintColor = t, this._iconElement.style.fill = t
        },
        reset: function () {
          this.classList.remove(u.PRESSED), this._focusDelegate.controlWasReleased(this)
        },
        handleEvent: function (t) {
          switch (t.type) {
            case n.startEventType:
              this.popover.toggleFocusStyle(!1);
              var e = n.getShadowDOMTargetFromEvent(this.element, t);
              this.popover.element.contains(e) || this.element.contains(e) || this._close();
              break;
            case "keydown":
              if (this.popover.toggleFocusStyle(!0), s.isEscapeKey(t)) {
                this._close();
                var i = n.containingDocumentOrShadowRoot(this.element).activeElement;
                i && this.popover.element.contains(i) && this.element.focus()
              }
              break;
            case "blur":
              this.popover.element.contains(t.relatedTarget) || this._close()
          }
        },
        didMoveToParent: function (t) {
          t ? (this.popover = new l(this._delegate), this.parent.insertAfter(this.popover, this)) : (window.removeEventListener(n.startEventType, this, !0), window.removeEventListener("keydown", this, !0), this.popover.element.removeEventListener("blur", this, !0), this.popover.remove(), this.popover = null)
        },
        focused: function (t) {
          this._focusDelegate.controlDidGetFocus(this)
        },
        blurred: function (t) {
          this._focusDelegate.controlDidLoseFocus(this)
        },
        _updateLabels: function () {
          n.updateLabel(this, a.get("MapType.Tooltip"))
        },
        _toggle: function (t) {
          this._isOpen ? this._close() : this._open(t)
        },
        _pressed: function () {
          this.classList.add(u.PRESSED), this._focusDelegate.controlWasPressed(this)
        },
        _open: function (t) {
          this._isOpen || (this._isOpen = !0, this.popover.open(), this.popover.toggleFocusStyle(t), window.addEventListener(n.startEventType, this, !0), window.addEventListener("keydown", this, !0), this.popover.element.addEventListener("blur", this, !0))
        },
        _close: function () {
          this._isOpen && (this._isOpen = !1, this.popover.close(), window.removeEventListener(n.startEventType, this, !0), window.removeEventListener("keydown", this, !0), this.popover.element.removeEventListener("blur", this, !0))
        },
        _handleLocaleChange: function () {
          this.children.forEach((function (t) {
            var e = t.element.getAttribute(h);
            t.element.textContent = a.get(e)
          }))
        },
        _updateIcon: function () {
          this._iconElement.setAttribute("d", p[this._mapType])
        }
      });
      var p = {
        standard: "M24.597 18.663V8.233L21.53 6.369a1.83 1.83 0 00-.413-.178v10.569l3.136 1.764c.06.03.116.058.171.083a.815.815 0 00.172.057zm-7.548-.178c.17 0 .356-.057.559-.171l2.615-1.416V6.285c-.06.026-.125.055-.197.089-.072.034-.14.07-.203.108l-2.958 1.695c-.199.11-.346.246-.44.41a1.118 1.118 0 00-.144.574v8.544c0 .25.07.442.207.577.137.136.324.203.561.203zm8.436.153a.641.641 0 00.204-.09l3.269-1.853c.203-.114.352-.251.447-.412.095-.161.143-.354.143-.578V7.18c0-.254-.07-.447-.21-.58-.14-.134-.332-.2-.577-.2-.17 0-.358.057-.565.17l-2.71 1.505v10.563z",
        hybrid: "M22.918 13.579c.13 0 .262-.023.393-.067.131-.044.275-.111.432-.2l4.951-2.875c.267-.157.456-.303.568-.438a.741.741 0 00.168-.49.724.724 0 00-.168-.475c-.112-.136-.301-.282-.568-.438L23.743 5.72a2.539 2.539 0 00-.432-.2 1.22 1.22 0 00-.79 0c-.129.045-.274.111-.435.2l-4.951 2.876c-.267.156-.456.302-.568.438a.724.724 0 00-.168.476c0 .19.056.353.168.489.112.135.301.28.568.438l4.951 2.875c.161.089.306.156.435.2.13.044.261.067.397.067zm0 3.135a.81.81 0 00.343-.076c.11-.05.237-.116.38-.197l5.409-3.192a.775.775 0 00.292-.28.656.656 0 00.095-.33.601.601 0 00-.12-.374.81.81 0 00-.267-.235l-5.847 3.377c-.055.034-.105.06-.152.08a.352.352 0 01-.133.028.366.366 0 01-.14-.029 1.063 1.063 0 01-.152-.08L16.78 12.03a.81.81 0 00-.267.235.601.601 0 00-.12.374c0 .11.032.22.098.33.065.11.164.203.295.28l5.402 3.192c.144.08.27.146.38.197.11.051.227.076.35.076zm0 2.94a.81.81 0 00.343-.077c.11-.05.237-.118.38-.203l5.409-3.186a.825.825 0 00.288-.277.644.644 0 00.099-.34.582.582 0 00-.12-.361.887.887 0 00-.267-.241l-5.847 3.383a2.55 2.55 0 01-.152.076.322.322 0 01-.133.032.335.335 0 01-.14-.032 2.55 2.55 0 01-.152-.076L16.78 14.97a.887.887 0 00-.267.241.582.582 0 00-.12.362c0 .118.032.231.098.34.065.107.164.2.295.275l5.402 3.187c.144.085.27.152.38.203.11.05.227.076.35.076z",
        satellite: "M22.915 18.923c.888 0 1.725-.169 2.51-.507a6.62 6.62 0 002.079-1.41 6.62 6.62 0 001.41-2.079 6.271 6.271 0 00.507-2.51c0-.889-.17-1.726-.508-2.51a6.583 6.583 0 00-1.41-2.076 6.682 6.682 0 00-2.081-1.41 6.26 6.26 0 00-2.514-.51c-.888 0-1.725.17-2.51.51a6.654 6.654 0 00-3.482 3.485 6.271 6.271 0 00-.508 2.511c0 .889.17 1.725.508 2.51a6.62 6.62 0 001.41 2.08c.6.6 1.293 1.07 2.078 1.409a6.271 6.271 0 002.51.507zm0-.92c-.762 0-1.48-.147-2.155-.441a5.732 5.732 0 01-1.781-1.21 5.687 5.687 0 01-1.206-1.78 5.37 5.37 0 01-.438-2.155c0-.762.146-1.479.438-2.152.209-.48.473-.92.794-1.32l.188-.222-.068.254a4.38 4.38 0 00-.127 1.04c0 .695.23 1.23.689 1.607.459.376 1.114.564 1.964.564.115 0 .196.04.245.121.048.08.041.171-.022.273a2.875 2.875 0 00-.311.584c-.055.157-.083.32-.083.489 0 .283.069.525.206.723.138.2.304.361.499.486a3.2 3.2 0 00.57.295l-.247.997c-.076.296-.039.53.111.704.15.174.348.26.594.26.245 0 .478-.114.698-.342l1.543-1.67c.258-.275.443-.524.555-.749.112-.224.168-.448.168-.672a1.11 1.11 0 00-.11-.426 3.165 3.165 0 00-.664-.958 1.378 1.378 0 00-.594-.337 3.345 3.345 0 00-.784-.076h-.342l-.35-.685.965-.362c.271.178.487.313.648.406.16.093.317.14.47.14.194 0 .347-.06.457-.178a.582.582 0 00.155-.435.742.742 0 00-.225-.485l-.99-1.048c-.064-.063-.096-.124-.096-.18 0-.058.028-.118.083-.182a4.83 4.83 0 00.431-.552c.144-.211.216-.442.216-.692a.813.813 0 00-.084-.357l-.045-.078.183.073c.675.292 1.27.695 1.784 1.21a5.709 5.709 0 011.21 1.78c.291.673.437 1.39.437 2.152a5.37 5.37 0 01-.438 2.155 5.687 5.687 0 01-1.206 1.78 5.732 5.732 0 01-1.78 1.21 5.336 5.336 0 01-2.155.44z"
      }
    },
    5819: (t, e, i) => {
      var n = i(9237),
        o = i(3658),
        s = i(2114),
        r = i(6430),
        a = i(270).Node,
        l = i(1232),
        h = ["Standard", "Hybrid", "Satellite"];

      function c(t) {
        n.call(this), this.classList.add(d.POP_OVER), this.delegate = t, this.buttonControls = {}, this.labels = {}, h.forEach(function (e) {
          var i = new a,
            n = t.mapTypes[e] === t.mapType,
            s = new r(e, t);
          i.addChild(s);
          var h = new a(o.htmlElement("div", {
            "aria-hidden": "true",
            class: d.MAP_TYPE_LABEL
          }));
          h.element.textContent = l.get("Mode." + e), i.addChild(h), this.addChild(i), this.buttonControls[e] = s, this.labels[e] = h, n && (this.selectedButtonControl = s)
        }.bind(this))
      }
      var d = {
        POP_OVER: "mk-map-type-popover",
        MAP_TYPE_LABEL: "mk-map-type-label"
      };
      c.prototype = s.inheritPrototype(n, c, {
        open: function () {
          n.prototype.open.call(this), h.forEach(function (t) {
            this.buttonControls[t].enabled = !0
          }.bind(this))
        },
        close: function () {
          n.prototype.close.call(this), h.forEach(function (t) {
            this.buttonControls[t].enabled = !1
          }.bind(this))
        },
        focus: function () {
          this.selectedButtonControl.element.focus()
        },
        updateSelected: function () {
          h.forEach(function (t) {
            var e = this.delegate.mapTypes[t] === this.delegate.mapType;
            this.buttonControls[t].setSelected(e), e && (this.selectedButtonControl = this.buttonControls[t])
          }.bind(this))
        },
        updateLabels: function () {
          h.forEach(function (t) {
            this.labels[t].element.textContent = l.get("Mode." + t)
          }.bind(this))
        }
      }), t.exports = c
    },
    9237: (t, e, i) => {
      var n = i(3658),
        o = i(2114),
        s = i(270).Node;

      function r() {
        s.call(this, n.htmlElement("div", {
          class: a.CONTROL,
          role: "dialog",
          tabindex: "-1"
        })), this.element.appendChild(n.createSVGIcon(n.svgElement("g", n.svgElement("rect", {
          y: 12,
          x: 0,
          height: 2,
          width: 30
        }), n.svgElement("path", {
          d: "M0 13v-.5c4.038 0 8.305-3.53 12.835-10.477.454-.71 1.005-1.137 1.564-1.326h.001a2.07 2.07 0 011.814.225c.273.175.505.407.68.68C21.525 8.829 25.881 12.5 30 12.5v.5"
        })), {
          class: a.ARROW,
          width: 30,
          height: 14
        }))
      }
      var a = {
        CONTROL: "mk-popover",
        ARROW: "mk-popover-arrow",
        SHOWN: "mk-shown",
        WITH_FOCUS_STYLE: "mk-focus-style"
      };
      r.prototype = o.inheritPrototype(s, r, {
        open: function () {
          this.classList.add(a.SHOWN)
        },
        toggleFocusStyle: function (t) {
          this.classList.toggle(a.WITH_FOCUS_STYLE, t)
        },
        handleEvent: function (t) {
          this.classList.contains(a.SHOWN) && this.focus()
        },
        focus: function () {
          this.element.focus()
        },
        close: function () {
          this.classList.remove(a.SHOWN)
        },
        didMoveToParent: function (t) {
          t ? this.element.addEventListener("transitionend", this) : this.element.removeEventListener("transitionend", this)
        }
      }), t.exports = r
    },
    9561: (t, e, i) => {
      var n = i(3658),
        o = i(2114),
        s = i(4438),
        r = i(1232),
        a = i(2640),
        l = i(4902),
        h = i(270),
        c = i(4937),
        d = i(3032),
        u = "mk-rotation-control",
        p = "mk-pressed",
        m = "mk-heading",
        g = "mk-rotation-wrapper",
        _ = "mk-rotation-slider";

      function f(t) {
        this.element = n.htmlElement("div"), s.call(this, this.element), this.classList.add(u);
        var e = n.htmlElement("input", {
          class: _,
          type: "range",
          min: 0,
          max: 360,
          value: 0,
          "aria-label": r.get("Compass.Degrees.Plural", {
            n: 0
          })
        });
        e.addEventListener("change", this), this._slider = e, this.element.appendChild(e), this._compassNode = new h.Node(n.htmlElement("div", {
          class: g
        }, n.htmlElement("img", {
          role: "presentation"
        }))), this.element.appendChild(this._compassNode.element);
        var i = n.htmlElement("div");
        this._heading = i, this._headingNode = new h.Node(i), this._headingNode.classList.add(m), this.element.appendChild(i), d.state === d.States.UNINITIALIZED ? d.addEventListener(d.Events.Initialized, (function t() {
          d.removeEventListener(d.Events.Initialized, t), w(this._compassNode.element.firstChild)
        })) : w(this._compassNode.element.firstChild), this._map = t, this._rotation = 0, this._activeKeyRightAt = null, this._activeKeyLeftAt = null, this._updateLabels()
      }

      function y(t, e, i, n) {
        var o = e - n,
          s = t - i;
        return t > i ? e < n ? 90 + v(Math.atan(o / s)) : 180 - v(Math.atan(s / o)) : e < n ? 360 - v(Math.atan(s / o)) : 0 !== s ? 270 + v(Math.atan(o / s)) : 180
      }

      function v(t) {
        return 180 * t / Math.PI
      }

      function w(t) {
        var e = a.createImageUrl("icons/compass-sheet.svg");
        t.crossOrigin = n.getCorsAttribute(d.distUrlWithCredentials), t.src = e
      }
      f.prototype = o.inheritPrototype(s, f, {
        enable: function () {
          s.prototype.enable.call(this), this._setupGestureRecognizers(), this._slider.removeAttribute("aria-disabled"), this._slider.setAttribute("tabindex", 0)
        },
        disable: function () {
          s.prototype.disable.call(this), this._slider.setAttribute("aria-disabled", "true"), this._slider.setAttribute("tabindex", -1)
        },
        set rotation(t) {
          t === this._rotation || 360 === this._rotation && 0 === t || (this._rotation = t, this._updateHeading(), this._updateSlider(), this._rotateTo(t))
        },
        localeChanged: function (t) {
          this._updateLabels()
        },
        mapWasDestroyed: function () {
          delete this._map
        },
        updateTintColor: function (t) {
          this.tintColor !== t && (this.tintColor = t, this._heading.style.color = t)
        },
        updateImage: function (t, e) {
          this._dprValue === t && this._darkColorScheme === e || (this._dprValue = t, this._darkColorScheme = e, d.state !== d.States.UNINITIALIZED && w(this._compassNode.element))
        },
        touchesEnded: function (t) {
          this.saveEndEventProps(t)
        },
        clicked: function (t) {
          this.checkClickEventProps(t) || this.reset(t)
        },
        reset: function (t) {
          this._map && this._center && this._map.compassDraggingDidEnd(), this.classList.remove(p), !t || t.target !== this._tapRecognizer && "click" !== t.type && t.keyCode !== o.KeyCodes.UpArrow && t.keyCode !== o.KeyCodes.SpaceBar || this._map.setRotationAnimated(0, !0), delete this._angleOffset, delete this._restricted
        },
        spaceBarKeyDown: function (t) {
          this.reset(t)
        },
        upArrowKeyUp: function (t) {
          this.reset(t)
        },
        rightArrowKeyDown: function (t) {
          this._beginKeyboardRotate(t)
        },
        rightArrowKeyUp: function (t) {
          this._endKeyboardRotate(t)
        },
        leftArrowKeyDown: function (t) {
          this._beginKeyboardRotate(t)
        },
        leftArrowKeyUp: function (t) {
          this._endKeyboardRotate(t)
        },
        performScheduledUpdate: function () {
          if (!this._activeKeyRightAt && !this._activeKeyLeftAt) return !1;
          this._keyboardRotate(), c.scheduleOnNextFrame(this)
        },
        handleEvent: function (t) {
          switch (t.target) {
            case this._tapRecognizer:
              t.target.state === l.States.Recognized && this.reset(t);
              break;
            case this._panRecognizer:
              t.target.state === l.States.Possible ? this._beginDrag(t) : t.target.state === l.States.Changed ? this._drag(t) : t.target.state !== l.States.Recognized && t.target.state !== l.States.Failed || this.reset(t);
              break;
            case this._slider:
              this._handleSliderChange(t)
          }
        },
        fadeIn: function () {
          this.element.style.opacity = 1
        },
        fadeOut: function () {
          this.element.style.opacity = 0
        },
        _updateHeading: function () {
          var t = 360 - this._rotation,
            e = Math.round(t / 360 * 4) % 4;
          this._heading.textContent = r.get("Compass." + ["NorthIndicator", "EastIndicator", "SouthIndicator", "WestIndicator"][e])
        },
        _updateLabels: function () {
          this._updateHeading(), n.updateLabel(this.element, r.get("Compass.Tooltip"))
        },
        _rotateTo: function (t) {
          return Math.abs(t) < 5 && (t = 0), this._compassNode.transform = "rotate(" + t + "deg)", t
        },
        _setupGestureRecognizers: function () {
          var t = new l.Tap;
          t.numberOfTapsRequired = 1, t.addEventListener("statechange", this), t.target = this.element, this._tapRecognizer = t;
          var e = new l.Pan;
          e.addEventListener("statechange", this), e.target = this.element, this._panRecognizer = e
        },
        removeEventListeners: function () {
          this._tapRecognizer.removeEventListener("statechange", this), this._tapRecognizer.enabled = !1, this._tapRecognizer.target = null, this._panRecognizer.removeEventListener("statechange", this), this._panRecognizer.enabled = !1, this._panRecognizer.target = null, this._slider.removeEventListener("change", this)
        },
        _beginDrag: function (t) {
          if (this._map.compassDraggingWillStart()) {
            this.classList.add(p);
            var e = this.element.getBoundingClientRect();
            this._center = {
              x: e.right - e.width / 2,
              y: e.bottom - e.height / 2
            };
            var i = y(t.target.locationInClient().x, t.target.locationInClient().y, this._center.x, this._center.y);
            this._angleOffset = i - this._map.rotation, this._restricted = this._map.compassRotationWillStart()
          }
        },
        _drag: function (t) {
          if (this._center && !isNaN(this._angleOffset)) {
            var e = y(t.target.locationInClient().x, t.target.locationInClient().y, this._center.x, this._center.y) - this._angleOffset;
            if (this._restricted) {
              var i = o.mod(e, 360),
                s = n.restrictRotation(i);
              e = i < 180 ? s + .025 * (i - s) : s - .025 * (s - i)
            }
            e = this._rotateTo(e), this._map.setRotationAnimated(e, !1, !0)
          }
        },
        _beginKeyboardRotate: function (t) {
          var e = this._activeKeyRightAt && t.keyCode === o.KeyCodes.RightArrow,
            i = this._activeKeyLeftAt && t.keyCode === o.KeyCodes.LeftArrow;
          if (!e && !i) {
            var n = Date.now();
            t.keyCode === o.KeyCodes.RightArrow ? this._activeKeyRightAt = n : this._activeKeyLeftAt = n, this._timeAtLastFrame = n, c.scheduleASAP(this), this._restricted = this._map.compassRotationWillStart()
          }
        },
        _keyboardRotate: function () {
          var t = Math.max(this._activeKeyRightAt || 0, this._activeKeyLeftAt || 0);
          if (t && this._timeAtLastFrame) {
            var e = Date.now(),
              i = this._rotation,
              s = e - this._timeAtLastFrame;
            i += (4 * (t === this._activeKeyLeftAt) ? -1 : 1) * (60 * s) / 1e3, this._map.rotation = this._restricted ? n.restrictRotation(o.mod(i, 360)) : i, this._timeAtLastFrame = Date.now()
          }
        },
        _endKeyboardRotate: function (t) {
          t.keyCode === o.KeyCodes.RightArrow ? this._activeKeyRightAt = null : this._activeKeyLeftAt = null, this._activeKeyRightAt || this._activeKeyLeftAt || (this._timeAtLastFrame = null), this._map.compassRotationDidEnd()
        },
        _handleSliderChange: function (t) {
          var e = parseInt(t.target.value);
          if (e !== this._rotation) {
            var i = e;
            0 === e ? i = 360 : 360 === e && (i = 0), this.rotation = i, this._map.setRotationAnimated(i, !1, !0)
          }
        },
        _updateSlider: function () {
          var t = Math.round(this._rotation);
          this._slider.value = t;
          var e = r.get(1 === t ? "Compass.Degrees.Single" : "Compass.Degrees.Plural", {
            n: t
          });
          this._slider.setAttribute("aria-label", e)
        }
      }), t.exports = f
    },
    1887: (t, e, i) => {
      var n = i(4438),
        o = i(9601),
        s = i(2114),
        r = i(3658),
        a = i(1232),
        l = i(210),
        h = i(6367),
        c = i(9328),
        d = i(4140),
        u = i(975).FeatureVisibility,
        p = new d(170, 20),
        m = "mk-scale";

      function g(t) {
        this._map = t, this.scene = new c.Scene, this.scene.size = p, this.node = this.scene.addChild(new h), this.node.size = p, this.node.position = new l(0, 0), this.node.opacity = 0, this.node.l10n = a, this.node.useMetric = t.useMetric, n.call(this, this.scene.element), this.classList.add(m), this.element.setAttribute("aria-hidden", "true"), this.size = p
      }
      g.prototype = s.inheritPrototype(n, g, {
        get shouldDisplayScale() {
          return this._map._showsScale === u.Visible || this._map._showsScale === u.Adaptive && this._map.cameraIsZooming
        },
        updateTheme: function (t) {
          this.node.theme = h.Themes[t]
        },
        update: function () {
          var t = this._map;
          if (this.node && this.shouldDisplayScale) {
            var e = t.renderingMapRect.origin.toCoordinate().latitude,
              i = t.renderingMapRect.size.width / o.mapUnitsPerMeterAtLatitude(e);
            i / t._visibleFrame.size.width * r.devicePixelRatio >= 7500 ? this.hideIfNeeded(!0) : (this.node.distance = i, this.node.useMetric = this._map.useMetric, this.node.setOpacityAnimated(1, !1))
          }
        },
        hideIfNeeded: function (t) {
          !this.node || this.shouldDisplayScale && !t || this.node.setOpacityAnimated(0, !0)
        },
        localeChanged: function () {
          this.node.useMetric = this._map.useMetric
        }
      }), t.exports = g
    },
    2979: (t, e, i) => {
      var n = i(3658),
        o = i(8961),
        s = i(2114),
        r = i(4438),
        a = i(1232),
        l = i(270),
        h = i(9816);
      t.exports = c;

      function c(t, e, i) {
        r.call(this, n.htmlElement("div", {
          class: d.CONTROL,
          role: "button",
          tabindex: "0"
        })), this._wrapper = n.htmlElement("div", {
          class: d.WRAPPER
        }), this.element.appendChild(this._wrapper), this._arrowIconNode = new l.Node(n.createSVGIcon(n.svgElement("path"), {
          class: d.ARROW_ICON,
          viewBox: p
        })), this._waitingIconNode = new l.Node(function () {
          for (var t = [], e = 0; e < 8; ++e) t.push(n.svgElement("rect", {
            x: -1.25,
            y: 5,
            width: 2.5,
            height: 6,
            rx: 1.25,
            transform: "rotate(" + 45 * e + ")"
          }));
          var i = ["g", {
            transform: "scale(0.6666666666666666, -0.6666666666666666)"
          }].concat(t);
          return n.createSVGIcon(n.svgElement.apply(null, i), {
            class: [d.WAITING_ICON, d.SCALED_OUT].join(" "),
            viewBox: m
          })
        }()), this._wrapper.appendChild(this._arrowIconNode.element), this._wrapper.appendChild(this._waitingIconNode.element), this._errorPopover = new h, this._updateLabels(), this._updateArrowIcon(), this._waitingIconBlades = this._waitingIconNode.element.querySelectorAll("rect"), this._map = t, this._rtl = e, this._focusDelegate = i
      }
      var d = {
        CONTROL: "mk-user-location-control",
        WRAPPER: "mk-user-location-control-wrapper",
        PRESSED: "mk-pressed",
        TRACKING: "mk-tracking",
        WAITING: "mk-waiting",
        DISABLED: "mk-disabled",
        WAITING_ICON: "mk-icon-waiting",
        ARROW_ICON: "mk-icon-arrow",
        SCALED_OUT: "mk-scaled-out"
      };
      c.States = {
        Default: "default",
        Waiting: "waiting",
        Tracking: "tracking",
        Disabled: "disabled"
      }, c.EVENTS = {
        PRESSED: "pressed"
      }, c.prototype = s.inheritPrototype(r, c, {
        _state: c.States.Default,
        _tintColor: "",
        get state() {
          return this._state
        },
        set state(t) {
          this._state !== t && (this._state = t, this.classList.toggle(d.TRACKING, this.isTrackingState()), this.classList.toggle(d.WAITING, this.isWaitingState()), this.classList.toggle(d.DISABLED, this.isDisabledState()), this.updateTintColor(this._tintColor), this.isWaitingState() ? this._animateArrowIconOut() : this._animateWaitingIconOut())
        },
        isDefaultState: function () {
          return this.state === c.States.Default
        },
        toDefaultState: function () {
          this.state = c.States.Default, this._updateArrowIcon(), this._closeErrorPopover()
        },
        isTrackingState: function () {
          return this.state === c.States.Tracking
        },
        toTrackingState: function () {
          this.state = c.States.Tracking, this._updateArrowIcon(), this._closeErrorPopover()
        },
        isWaitingState: function () {
          return this.state === c.States.Waiting
        },
        toWaitingState: function () {
          this.state = c.States.Waiting
        },
        isDisabledState: function () {
          return this.state === c.States.Disabled
        },
        toDisabledState: function () {
          this._map.tracksUserLocation && this._map.userLocationAnnotation || (this.state = c.States.Disabled, this._updateArrowIcon(), this._openErrorPopover())
        },
        handleEvent: function (t) {
          switch (t.type) {
            case n.startEventType:
              var e = n.getShadowDOMTargetFromEvent(this.element, t);
              this._errorPopover.errorMessageElement.contains(e) || (this._closeErrorPopover(), window.removeEventListener(n.startEventType, this, !0));
              break;
            case "keydown":
              27 === t.keyCode && this._closeErrorPopover();
              break;
            case "blur":
              this._errorPopover.element.contains(t.relatedTarget) || this._closeErrorPopover()
          }
        },
        touchesBegan: function (t) {
          this._pressed(t)
        },
        touchesEnded: function () {
          this.reset()
        },
        clicked: function () {
          this.dispatchEvent(new o.Event(c.EVENTS.PRESSED))
        },
        touchesCanceled: function (t) {
          this.reset()
        },
        spaceBarKeyDown: function (t) {
          this._pressed(t)
        },
        spaceBarKeyUp: function (t) {
          this.reset(t), this.dispatchEvent(new o.Event(c.EVENTS.PRESSED))
        },
        updateTintColor: function (t) {
          this._tintColor = t, this._arrowIconNode.element.querySelector("g").style.fill = this.isTrackingState() ? "" : t, this._waitingIconNode.element.querySelector("g").style.fill = t, this.element.style.backgroundColor = this.isTrackingState() ? t : ""
        },
        reset: function () {
          this.classList.contains(d.PRESSED) && (this.classList.remove(d.PRESSED), this._focusDelegate.controlWasReleased(this), this.isDefaultState() || this.isDisabledState() ? this.toWaitingState() : this.toDefaultState()), delete this._mousedown, window.removeEventListener(n.endEventType, this), n.supportsPointerEvents ? window.removeEventListener("pointercancel", this) : n.supportsTouches && window.removeEventListener("touchcancel", this)
        },
        localeChanged: function (t) {
          this._updateLabels(), this._rtl = t.locale.rtl, this._errorPopover.update()
        },
        mapWasDestroyed: function () {
          delete this._map
        },
        focused: function (t) {
          this._focusDelegate.controlDidGetFocus(this)
        },
        blurred: function (t) {
          this._focusDelegate.controlDidLoseFocus(this)
        },
        didMoveToParent: function (t) {
          t ? this.parent.insertAfter(this._errorPopover, this) : (this._closeErrorPopover(), this._errorPopover.remove())
        },
        _updateLabels: function () {
          n.updateLabel(this.element, a.get("Track.User.Location.Tooltip"))
        },
        _pressed: function (t) {
          this.classList.add(d.PRESSED), this._focusDelegate.controlWasPressed(this)
        },
        _animateArrowIconOut: function () {
          this._arrowIconNode.classList.add(d.SCALED_OUT), this._waitingIconNode.classList.remove(d.SCALED_OUT)
        },
        _animateWaitingIconOut: function () {
          this._waitingIconNode.classList.add(d.SCALED_OUT), this._arrowIconNode.classList.remove(d.SCALED_OUT)
        },
        _openErrorPopover: function () {
          this._errorPopover.open(), window.addEventListener(n.startEventType, this, !0), window.addEventListener("keydown", this, !0), this._errorPopover.element.addEventListener("blur", this, !0)
        },
        _closeErrorPopover: function () {
          this._errorPopover.close(), window.removeEventListener(n.startEventType, this, !0), window.removeEventListener("keydown", this, !0), this._errorPopover.element.removeEventListener("blur", this, !0)
        },
        _updateArrowIcon: function () {
          this._arrowIconNode.element.querySelector("path").setAttribute("d", u[this.state])
        }
      });
      var u = {
        default: "M24.675 17.91L29.48 7.512c.514-1.11-.349-1.847-1.409-1.358l-10.448 4.818c-.971.444-.768 1.802.342 1.809l4.723.019c.095 0 .127.038.127.133l.013 4.691c0 1.092 1.365 1.34 1.847.286zm-.711-1.448l.025-4.272c0-.387-.184-.577-.584-.577l-4.272.025c-.05 0-.07-.057-.012-.089l8.95-4.094c.076-.032.12.013.082.089l-4.1 8.925c-.025.063-.089.05-.089-.007z",
        disabled: "M27.112 12.641l2.368-5.129c.514-1.11-.349-1.847-1.409-1.358l-5.097 2.348.882.883 4.215-1.93c.076-.032.12.013.082.089l-1.93 4.208.89.89zm2.4 4.196a.51.51 0 000-.717l-9.934-9.934a.517.517 0 00-.724 0 .522.522 0 000 .717l9.947 9.934c.197.197.52.197.71 0zm-4.837 1.073l1.301-2.812-.882-.883-1.041 2.254c-.025.063-.089.05-.089-.007l.02-3.351-1.493-1.492-3.358.02c-.05 0-.07-.058-.012-.09l2.266-1.034-.876-.876-2.888 1.333c-.971.444-.768 1.802.342 1.809l4.723.019c.095 0 .127.038.127.133l.013 4.691c0 1.092 1.365 1.34 1.847.286z",
        tracking: "M24.675 17.91L29.48 7.512c.514-1.11-.349-1.847-1.409-1.358l-10.448 4.818c-.971.444-.768 1.802.342 1.809l4.723.019c.095 0 .127.038.127.133l.013 4.691c0 1.092 1.365 1.34 1.847.286z"
      },
        p = "0 0 45 24",
        m = "-22.5 -12 45 24"
    },
    9816: (t, e, i) => {
      var n = i(9237),
        o = i(2114),
        s = i(3658),
        r = i(270).Node,
        a = i(1232);

      function l() {
        n.call(this), this.classList.add(h.POP_OVER), this._errorMessageElement = this._createErrorMessageElement(), this._errorMessageNode = new r(this._errorMessageElement), this.update(), this.addChild(this._errorMessageNode)
      }
      var h = {
        POP_OVER: "mk-user-location-error-popover",
        ERROR: "mk-error-message",
        ERROR_TEXT: "mk-error-text",
        ERROR_SUPPORT: "mk-error-support"
      };
      l.prototype = o.inheritPrototype(n, l, {
        get errorMessageElement() {
          return this._errorMessageElement
        },
        update: function () {
          this._errorMessageElement.getElementsByClassName(h.ERROR_TEXT)[0].textContent = a.get("Location.Error.Message") + " ", this._supportLink.textContent = a.get("Location.Error.Support.Label"), s.supportsTouches ? this._supportLink.href = "https://support.apple.com/HT203033" : this._supportLink.href = "https://support.apple.com/guide/mac-help/allow-apps-to-detect-the-location-of-your-mac-mh35873/mac"
        },
        _createErrorMessageElement: function () {
          var t = s.htmlElement("div", {
            class: h.ERROR
          });
          return this._supportLink = s.htmlElement("a", {
            class: h.ERROR_SUPPORT,
            target: "__blank"
          }), t.appendChild(s.htmlElement("span", {
            class: h.ERROR_TEXT
          })), t.appendChild(this._supportLink), t
        }
      }), t.exports = l
    },
    3141: (t, e, i) => {
      var n = i(3658),
        o = i(8961),
        s = i(2114),
        r = i(4438),
        a = i(270),
        l = i(1232);

      function h() {
        var t, e = n.htmlElement("div");
        r.call(this, e), this.classList.add(c.CONTROL), this._zoomInButton = n.htmlElement("div", {
          role: "button",
          tabindex: "0"
        }), this._zoomInButtonNode = new a.Node(this._zoomInButton), this._zoomInButtonNode.classList.add(c.BUTTON_ZOOM_IN), this._zoomInButton.appendChild((t = n.svgElement("path", {
          d: "M11.813 17.404c.4 0 .724-.33.724-.705v-3.974h3.872a.726.726 0 00.717-.723.73.73 0 00-.717-.724h-3.872V7.305a.72.72 0 00-.724-.705.724.724 0 00-.724.705v3.973H7.217a.739.739 0 00-.717.724c0 .4.343.723.717.723h3.872V16.7c0 .375.33.705.724.705z"
        }), n.createSVGIcon(t, {
          width: 24,
          height: 24
        }))), e.appendChild(this._zoomInButton), e.appendChild(n.htmlElement("div", {
          class: c.BUTTON_DIVIDER
        })), this._zoomOutButton = n.htmlElement("div", {
          role: "button",
          tabindex: "0"
        }), this._zoomOutButtonNode = new a.Node(this._zoomOutButton), this._zoomOutButtonNode.classList.add(c.BUTTON_ZOOM_OUT), this._zoomOutButton.appendChild(function () {
          var t = n.svgElement("path", {
            d: "M16.325 12.75c.364 0 .675-.336.675-.75 0-.408-.31-.75-.675-.75h-8.65c-.352 0-.675.342-.675.75 0 .414.323.75.675.75h8.65z"
          });
          return n.createSVGIcon(t, {
            width: 24,
            height: 24
          })
        }()), e.appendChild(this._zoomOutButton), this._updateLabels()
      }
      t.exports = h;
      var c = {
        CONTROL: "mk-zoom-controls",
        BUTTON_DIVIDER: "mk-divider",
        BUTTON_ZOOM_IN: "mk-zoom-in",
        BUTTON_ZOOM_OUT: "mk-zoom-out",
        PRESSED: "mk-pressed",
        PILL_PRESSED: "mk-pill-pressed",
        DISABLED: "mk-disabled"
      };

      function d(t, e) {
        e ? (t.classList.remove(c.DISABLED), t.element.removeAttribute("aria-disabled"), t.setAttribute("tabindex", 0)) : (t.classList.add(c.DISABLED), t.setAttribute("aria-disabled", "true"), t.setAttribute("tabindex", -1))
      }
      h.EVENTS = {
        ZOOM_START: "zoom-start",
        ZOOM_END: "zoom-end"
      }, h.prototype = s.inheritPrototype(r, h, {
        _zoomInEnabled: !0,
        _zoomOutEnabled: !0,
        get zoomInEnabled() {
          return this._zoomInEnabled
        },
        set zoomInEnabled(t) {
          this._enabled && t === this._zoomInEnabled || (this._zoomInEnabled = this._enabled && t, d(this._zoomInButtonNode, this._zoomInEnabled))
        },
        get zoomOutEnabled() {
          return this._zoomOutEnabled
        },
        set zoomOutEnabled(t) {
          this._enabled && t === this._zoomOutEnabled || (this._zoomOutEnabled = this._enabled && t, d(this._zoomOutButtonNode, this._zoomOutEnabled))
        },
        localeChanged: function (t) {
          this._updateLabels()
        },
        touchesBegan: function (t) {
          this._pressed(t)
        },
        touchesEnded: function (t) {
          this.saveEndEventProps(t), this.reset(t)
        },
        clicked: function (t) {
          this.checkClickEventProps(t) || (this._pressed(t), this.reset(t))
        },
        touchesCanceled: function (t) {
          this.reset(t)
        },
        focused: function (t) {
          this.updateTintColor(this.tintColor), t.target.style.fill = n.focusColor
        },
        blurred: function (t) {
          this.updateTintColor(this.tintColor)
        },
        spaceBarKeyDown: function (t) {
          this._pressed(t)
        },
        spaceBarKeyUp: function (t) {
          this.reset(t)
        },
        updateTintColor: function (t) {
          this.tintColor = t, this._zoomInButton.firstChild.style.fill = t, this._zoomOutButton.firstChild.style.fill = t
        },
        reset: function (t) {
          var e;
          if (this._zoomInButtonNode.classList.contains(c.PRESSED) ? e = this._zoomInButtonNode : this._zoomOutButtonNode.classList.contains(c.PRESSED) && (e = this._zoomOutButtonNode), e) {
            e.classList.remove(c.PRESSED), this.classList.remove(c.PILL_PRESSED);
            var i = new o.Event(h.EVENTS.ZOOM_END);
            this.dispatchEvent(i)
          }
          window.removeEventListener(n.endEventType, this), n.supportsPointerEvents ? window.removeEventListener("pointercancel", this) : n.supportsTouches && window.removeEventListener("touchcancel", this)
        },
        _clearLabels: function (t) {
          n.updateLabel(this._zoomInButtonNode, ""), n.updateLabel(this._zoomOutButtonNode, "")
        },
        _updateLabels: function (t) {
          n.updateLabel(this._zoomInButtonNode, l.get("Zoom.In.Tooltip")), n.updateLabel(this._zoomOutButtonNode, l.get("Zoom.Out.Tooltip"))
        },
        _pressed: function (t) {
          var e = this._findButtonNodeFromButtonDOMElement(n.parentNodeForSvgTarget(t.target));
          if (e && !e.classList.contains(c.DISABLED)) {
            if (this.hasFocus) {
              var i = n.containingDocumentOrShadowRoot(this.element).activeElement;
              i !== e.element && i.blur()
            }
            e.classList.add(c.PRESSED), this.classList.add(c.PILL_PRESSED);
            var s = new o.Event(h.EVENTS.ZOOM_START);
            s.zoomIn = e === this._zoomInButtonNode, this.dispatchEvent(s)
          }
        },
        _findButtonNodeFromButtonDOMElement: function (t) {
          return t === this._zoomOutButton ? this._zoomOutButtonNode : t === this._zoomInButton ? this._zoomInButtonNode : null
        }
      })
    },
    5870: (t, e, i) => {
      "use strict";
      var n = i(9601),
        o = i(8877).XHRLoader,
        s = i(3032),
        r = n.MapPoint,
        a = Math.pow(2, 21);

      function l(t) {
        var e = t.toMapPoint(),
          i = a * n.tileSize;
        return {
          x: Math.floor(e.x * i),
          y: Math.floor(e.y * i),
          z: 21
        }
      }
      e.shift = function (t, e) {
        var i = s.locationShiftUrl;
        ! function (t, e, i) {
          new o(e, {
            getDataToSend: function () {
              return t
            },
            loaderDidSucceed: function (t, e) {
              if (e.status < 200 || e.status >= 300) i(new Error("HTTP error:" + e.status));
              else try {
                i(null, JSON.parse(e.responseText))
              } catch (t) {
                return void i(new Error("Failed to parse response: " + e.responseText))
              }
            },
            loaderDidFail: function (t, e) {
              i(new Error("Network error"))
            }
          }, {
            method: "POST",
            withCredentials: s.withCredentials
          }).schedule()
        }(JSON.stringify({
          pixelPoint: l(t)
        }), i, (function (t, i) {
          t ? e(new Error) : i && i.shiftedPixelPoint ? e(null, function (t) {
            function e(t) {
              return t / a / n.tileSize
            }
            return new r(e(t.x), e(t.y)).toCoordinate()
          }(i.shiftedPixelPoint)) : e(new Error)
        }))
      }
    },
    1998: t => {
      t.exports = ".mk-map-view{width:100%;height:100%;overflow:hidden;-webkit-tap-highlight-color:transparent}.mk-map-view.mk-dragging-annotation{cursor:none}.mk-map-view.mk-disable-all-gestures{touch-action:none}.mk-map-view.mk-disable-pinch-gestures{touch-action:pan-x pan-y}.mk-map-view.mk-disable-zoom-gestures{touch-action:manipulation}.mk-map-view.mk-disable-pan-gestures{touch-action:none;touch-action:pinch-zoom}div.mk-map-view.mk-map-view img,div.mk-map-view.mk-map-view svg{margin:0;padding:0}.mk-annotation-container,.mk-map-view{z-index:0}.mk-map-view>*{position:absolute;left:0;-webkit-user-select:none;-moz-user-select:none}.mk-map-view .rt-root{letter-spacing:.3px}.mk-controls-container{position:absolute;overflow:hidden;top:0;bottom:0;left:0;right:0;z-index:3;pointer-events:none}.mk-map-view .mk-annotation-container,.mk-map-view .mk-controls-container{-ms-user-select:text}.mk-map-view.mk-panning ::selection{background:0 0}.mk-map-view.mk-dragging-cursor{cursor:pointer;cursor:-moz-grabbing;cursor:-webkit-grabbing;cursor:grabbing}.mk-map-view>iframe{width:100%;height:100%;pointer-events:none;opacity:0;border:0}"
    },
    4526: (t, e, i) => {
      "use strict";
      var n = i(8877).XHRLoader,
        o = i(8316),
        s = i(6246);
      t.exports = function (t, e) {
        var i, r, a, l = "function" == typeof e,
          h = "object" == typeof e,
          c = "string" == typeof t;
        if (c && !l && !h) throw new Error("[MapKit] For GeoJSON file imports, a callback must be provided as a second argument");
        return c ? (r = function (t, i) {
          if (!t) return o.importGeoJSON(i, e);
          h && e.geoJSONDidError ? s(e.geoJSONDidError, e, [t]) : l && s(e, null, [t])
        }, (a = new n(i = t, {
          loaderDidSucceed: function (t, e) {
            var n;
            try {
              n = JSON.parse(e.responseText)
            } catch (t) {
              return void r(new Error("[MapKit] The response of " + i + " does not appear to be valid JSON:" + e.responseText))
            }
            r(null, n)
          },
          loaderDidFail: function (t, e) {
            r(new Error("[MapKit] Failed to load " + i))
          }
        })).schedule(), a.id) : o.importGeoJSON(t, e)
      }
    },
    2971: (t, e, i) => {
      var n = i(4891),
        o = i(3032),
        s = i(2466),
        r = i(2114),
        a = i(2607),
        l = i(6783),
        h = i(6408);

      function c() {
        throw new TypeError("[MapKit] MapKit may not be constructed.")
      }
      window.DOMPoint || (window.DOMPoint = i(8212)), c.prototype = r.inheritPrototype(s.EventTarget, c, {
        init: function (t) {
          o.init(t);
          var e = function (t) {
            var e = new s.Event(t.type);
            e.status = t.status, this.dispatchEvent(e)
          }.bind(this);
          o.addEventListener(o.Events.Changed, e), o.addEventListener(o.Events.Error, e)
        },
        get version() {
          return n.version
        },
        get build() {
          return n.build + "" + a
        },
        get language() {
          return o.language
        },
        set language(t) {
          o.language = t
        },
        toString: function () {
          return ["MapKit JS", this.version, "(" + this.build + ")"].join(" ")
        },
        get _tileProvider() {
          return o.tileProvider
        },
        get _countryCode() {
          return o.countryCode
        },
        set _countryCode(t) {
          o.countryCode = t
        },
        _restore: function () {
          o._restore()
        },
        get _environment() {
          return o.environment
        }
      });
      var d = ["importGeoJSON", "FeatureVisibility", "CoordinateRegion", "CoordinateSpan", "Coordinate", "BoundingRegion", "MapPoint", "MapRect", "MapSize", "Padding", "CameraZoomRange", "Style", "LineGradient", "CircleOverlay", "PolylineOverlay", "PolygonOverlay", "Geocoder", "Search", "Directions", "PointsOfInterestSearch", "Map", "Annotation", "PinAnnotation", "ImageAnnotation", "MarkerAnnotation", "TileOverlay", "PointOfInterestCategory", "PointOfInterestFilter"],
        u = !1;
      h(l), l.addEventListener(l.Events.LOAD, (function (t) {
        var e = t.jsModules;
        if (e.mapkit && Object.keys(e.mapkit).forEach((function (t) {
          var i = d.indexOf(t); - 1 !== i && (delete c.prototype[t], c.prototype[t] = e.mapkit[t], d.splice(i, 1))
        })), e.MapInternal && (delete c.prototype.maps, Object.defineProperty(c.prototype, "maps", {
          get: function () {
            return e.MapInternal.maps
          }
        })), e.PointOfInterestFilter && (delete c.prototype.filterIncludingAllCategories, delete c.prototype.filterExcludingAllCategories, Object.defineProperties(c.prototype, {
          filterIncludingAllCategories: {
            get: function () {
              return e.PointOfInterestFilter.filterIncludingAllCategories
            }
          },
          filterExcludingAllCategories: {
            get: function () {
              return e.PointOfInterestFilter.filterExcludingAllCategories
            }
          }
        })), !u && l.jsModules.css && l.jsModules.utils && (document.head.appendChild(l.jsModules.utils.htmlElement("style", l.jsModules.css)), u = !0), l.IS_CHUNKED) {
          var i = new s.Event("load");
          i.libraryName = t.libraryName, p.dispatchEvent(i)
        }
      })), l.IS_CHUNKED ? (window.mapkit && window.mapkit.constructor && window.mapkit.constructor.__l && (c.prototype.constructor.__l = window.mapkit.constructor.__l), c.prototype.Libraries = l.Libraries, c.prototype.load = function (t) {
        l.load(t)
      }, l.addEventListener(l.Events.LOAD_ERROR, (function (t) {
        var e = new s.Event("load-error");
        e.libraryName = t.libraryName, p.dispatchEvent(e)
      })), d.concat(["maps", "filterIncludingAllCategories", "filterExcludingAllCategories"]).forEach((function (t) {
        Object.defineProperty(c.prototype, t, {
          get: function () {
            throw new Error("[MapKit] mapkit." + t + " is not available until the required library is loaded.")
          },
          configurable: !0,
          enumerable: !0
        })
      }))) : l.loadAll();
      var p = Object.create(c.prototype);
      t.exports = p
    },
    5193: (t, e, i) => {
      var n = i(3658),
        o = i(2114),
        s = i(4937);

      function r(t, e) {
        this._delegate = e, this._snapsToIntegralZoomLevels = t
      }
      r.prototype = {
        constructor: r,
        _speed: .03,
        _startTime: 0,
        _shouldStop: !1,
        _animating: !1,
        start: function (t, e) {
          var i = Date.now();
          return this._gasPedalValue = 0, this._startTime = i, this._shouldStop && this._cleanUp(), this._shouldStop = !1, this.zoomsIn = !!e, n.supportsForceTouch && window.addEventListener("webkitmouseforcechanged", this), !this._animating && (this._animating = !0, this._zoomLevel = t, this._timeAtLastFrame = i, s.scheduleOnNextFrame(this), !0)
        },
        stop: function () {
          this._shouldStop = !0, n.supportsForceTouch && (window.removeEventListener("webkitmouseforcechanged", this), delete this._speed)
        },
        set snapsToIntegralZoomLevels(t) {
          this._snapsToIntegralZoomLevels = !!t
        },
        performScheduledUpdate: function () {
          var t = !0,
            e = Date.now(),
            i = e - this._timeAtLastFrame,
            n = this._speed * (this.zoomsIn ? 1 : -1);
          this._zoomLevel += 60 * i * o.log2(1 + n) / 1e3, this._timeAtLastFrame = e, this._shouldStop && e - this._startTime >= 250 && (this._zoomLevelAtWhichToStop ? (t = this.zoomsIn && this._zoomLevel < this._zoomLevelAtWhichToStop || !this.zoomsIn && this._zoomLevel > this._zoomLevelAtWhichToStop) || (this._zoomLevel = this._zoomLevelAtWhichToStop) : this._snapsToIntegralZoomLevels ? this._zoomLevelAtWhichToStop = this.zoomsIn ? Math.ceil(this._zoomLevel) : Math.floor(this._zoomLevel) : t = !1), this._delegate && this._delegate.linearZoomControllerDidZoom(this._zoomLevel), t ? s.scheduleOnNextFrame(this) : this._cleanUp()
        },
        handleEvent: function (t) {
          this._handleForceChangedEvent(t)
        },
        _handleForceChangedEvent: function (t) {
          var e = o.clamp(t.webkitForce, MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN, MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN) - MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN;
          Math.abs(e - this._gasPedalValue) > .01 && (this._gasPedalValue = e), this._speed = .01 + this._gasPedalValue * (.06 - .01)
        },
        _cleanUp: function () {
          this._animating = !1, this._shouldStop = !1, delete this._zoomLevelAtWhichToStop, this._delegate && this._delegate.linearZoomControllerDidStop()
        }
      }, t.exports = r
    },
    2764: (t, e, i) => {
      var n = i(2114),
        o = i(210),
        s = i(4902);

      function r() {
        s.LongPress.call(this), this.minimumPressDuration = 500
      }
      r.prototype = n.inheritPrototype(s.LongPress, r, {
        constructor: r,
        touchesBegan: function (t) {
          (n.isIEAndNotEdge() || n.isEdge()) && document.getSelection().removeAllRanges(), s.LongPress.prototype.touchesBegan.call(this, t), this._domEvents.push(t), this.translation = new o, this._translationOrigin = this._lastTouchLocation = this.locationInElement()
        },
        enterRecognizedState: function () {
          s.LongPress.prototype.enterBeganState.call(this)
        },
        touchesMoved: function (t) {
          this.preventDefault(t);
          var e = this.locationInElement();
          this.state === s.States.Possible ? s.LongPress.prototype.touchesMoved.call(this, t) : this.state !== s.States.Began && this.state !== s.States.Changed || (this.translation.x += e.x - this._lastTouchLocation.x, this.translation.y += e.y - this._lastTouchLocation.y, this.enterChangedState()), this._lastTouchLocation = e
        },
        touchesCanceled: function (t) {
          this.interruptGesture()
        },
        touchesEnded: function (t) {
          this.state === s.States.Changed ? (this.preventDefault(t), this.enterEndedState()) : this.enterFailedState()
        },
        interruptGesture: function () {
          this.state === s.States.Changed ? this.enterEndedState() : this.state === s.States.Began && this.enterFailedState()
        },
        reset: function () {
          s.LongPress.prototype.reset.call(this), delete this._translationOrigin, delete this._lastTouchLocation, this._domEvents = []
        }
      }), t.exports = r
    },
    3180: (t, e, i) => {
      var n = i(4902),
        o = i(2764),
        s = i(3658),
        r = "mk-disable-all-gestures",
        a = "mk-disable-pan-gestures",
        l = "mk-disable-pinch-gestures",
        h = "mk-disable-zoom-gestures";

      function c(t, e) {
        this._target = t, this._delegate = e, this._touchCount = 0, this.initialEventTargetForCurrentInteraction = null, this._doubleTapWithOneFingerRecognizer = this._addGestureRecognizer(n.Tap), this._doubleTapWithOneFingerRecognizer.numberOfTouchesRequired = 1, this._doubleTapWithOneFingerRecognizer.numberOfTapsRequired = 2, this._singleTapWithOneFingerRecognizer = this._addGestureRecognizer(n.Tap), this._longPressAndPanRecognizer = this._addGestureRecognizer(o), this._longPressAndPanRecognizer.delegate = this, t.addEventListener(s.startEventType, this), t.addEventListener("dragstart", this), this.updateGestureEnableState()
      }
      c.prototype = {
        constructor: c,
        handleEvent: function (t) {
          switch (t.type) {
            case "pointerdown":
              this._installEndListeners(), this._touchCount++, this.initialEventTargetForCurrentInteraction = this._delegate.getEventTargetFromSubShadowDOM(t), this._suppressDefaultBehavior(t);
              break;
            case "pointerup":
            case "pointercancel":
              this._touchCount--, 0 === this._touchCount && (this._removeEndListeners(), document.removeEventListener("selectstart", this, !0), this.initialEventTargetForCurrentInteraction = null);
              break;
            case "dragstart":
              this._delegate.elementShouldPreventDragstart(t.target) && t.preventDefault();
              break;
            case "mousedown":
              this._installEndListeners(), this.initialEventTargetForCurrentInteraction = this._delegate.getEventTargetFromSubShadowDOM(t), this._suppressDefaultBehavior(t);
              break;
            case "mouseup":
              this._removeEndListeners(), document.removeEventListener("selectstart", this, !0), this.initialEventTargetForCurrentInteraction = null;
              break;
            case "touchstart":
              t.touches.length === t.changedTouches.length && (this._installEndListeners(), this.initialEventTargetForCurrentInteraction = this._delegate.getEventTargetFromSubShadowDOM(t), this._delegate.elementWantsDefaultBrowserBehavior(this.initialEventTargetForCurrentInteraction, t, t.touches.length) || t.preventDefault());
              break;
            case "touchend":
            case "touchcancel":
              0 === t.touches.length && (this._removeEndListeners(), this.initialEventTargetForCurrentInteraction = null);
              break;
            case "statechange":
              this._handleStatechange(t);
              break;
            case "selectstart":
              t.preventDefault()
          }
        },
        _handleStatechange: function (t) {
          switch (t.target) {
            case this._doubleTapWithOneFingerRecognizer:
              this._handleDoubleTapWithOneFingerChange(t);
              break;
            case this._singleTapWithOneFingerRecognizer:
              this._handleSingleTapWithOneFingerChange(t);
              break;
            case this._longPressAndPanRecognizer:
              this._handleLongPressAndPanChange(t)
          }
        },
        gestureRecognizerShouldBegin: function (t) {
          return this._delegate.userDidLongPress(t)
        },
        updateGestureEnableState: function () {
          var t = (this._delegate.isScrollEnabled ? 1 : 0) | (this._delegate.isRotationEnabled ? 2 : 0) | (this._delegate.isZoomEnabled ? 4 : 0),
            e = [void 0, a, l, r, h, r, l, r];
          this._delegate.rootNode.classList.remove(r), this._delegate.rootNode.classList.remove(a), this._delegate.rootNode.classList.remove(l), this._delegate.rootNode.classList.remove(h), e[t] && this._delegate.rootNode.classList.add(e[t])
        },
        mapWasDestroyed: function () {
          this._removeEndListeners(), this._target.removeEventListener(s.startEventType, this), this._target.removeEventListener("dragstart", this), this._doubleTapWithOneFingerRecognizer.removeEventListener("statechange", this), this._doubleTapWithOneFingerRecognizer.enabled = !1, this._doubleTapWithOneFingerRecognizer = null, this._singleTapWithOneFingerRecognizer.removeEventListener("statechange", this), this._singleTapWithOneFingerRecognizer.enabled = !1, this._singleTapWithOneFingerRecognizer = null, this._longPressAndPanRecognizer.removeEventListener("statechange", this), this._longPressAndPanRecognizer.enabled = !1, this._longPressAndPanRecognizer.delegate = null, this._longPressAndPanRecognizer = null, window.clearTimeout(this._delayedSingleTapRecognizerTimeoutID), delete this.initialEventTargetForCurrentInteraction, delete this._target, delete this._delegate
        },
        _addGestureRecognizer: function (t) {
          var e = new t;
          return e.target = this._target, e.addEventListener("statechange", this), e
        },
        _handleDoubleTapWithOneFingerChange: function (t) {
          var e = t.target;
          e.state === n.States.Recognized && (this._delayedSingleTapRecognizerTimeoutID && (this._delegate.userCanceledTap(), window.clearTimeout(this._delayedSingleTapRecognizerTimeoutID), delete this._delayedSingleTapRecognizerTimeoutID), this._singleTapWithOneFingerRecognizer.enabled = !1, this._delegate.userDidDoubleTap(e))
        },
        _handleSingleTapWithOneFingerChange: function (t) {
          var e = t.target;
          if (this._singleTapWithOneFingerRecognizer.enabled && e.state === n.States.Recognized) {
            this._delegate.userWillTap(e);
            var i = this._delegate.shouldDelaySingleTap() ? 350 : 0;
            this._delayedSingleTapRecognizerTimeoutID = window.setTimeout(function () {
              delete this._delayedSingleTapRecognizerTimeoutID, this._delegate.userDidTap()
            }.bind(this), i)
          }
        },
        _handleLongPressAndPanChange: function (t) {
          var e = t.target;
          switch (e.state) {
            case n.States.Possible:
              this._delegate.userMayStartPanningAfterLongPress();
              break;
            case n.States.Began:
              this._singleTapWithOneFingerRecognizer.enabled = !1, this._doubleTapWithOneFingerRecognizer.enabled = !1, this._doubleTapWithOneFingerRecognizer.enabled = !0;
              break;
            case n.States.Changed:
              this._delegate.userDidPanAfterLongPress(e.translation);
              break;
            case n.States.Ended:
            case n.States.Failed:
              this._singleTapWithOneFingerRecognizer.enabled = !0, this._delegate.userDidStopPanningAfterLongPress(e.state !== n.States.Failed)
          }
        },
        _stopDraggingAnnotation: function () {
          this._longPressAndPanRecognizer.interruptGesture()
        },
        _suppressDefaultBehavior: function (t) {
          this._delegate.elementWantsDefaultBrowserBehavior(this.initialEventTargetForCurrentInteraction, t, this._touchCount) || ((!("pointerType" in t) || "mouse" === t.pointerType) && s.insideIframe ? (document.addEventListener("selectstart", this, !0), document.getSelection().removeAllRanges()) : t.preventDefault())
        },
        _installEndListeners: function () {
          window.addEventListener(s.endEventType, this), s.cancelEventType && window.addEventListener(s.cancelEventType, this)
        },
        _removeEndListeners: function () {
          window.removeEventListener(s.endEventType, this), s.cancelEventType && window.removeEventListener(s.cancelEventType, this)
        }
      }, t.exports = c
    },
    1232: (t, e, i) => {
      var n = i(5239),
        o = i(2114),
        s = i(3032),
        r = i(2640),
        a = "locales/{{locale}}/strings.json",
        l = new n.L10n({
          supportedLocales: i(8946),
          primaryLocales: i(2245),
          localesMap: i(3120),
          regionToScriptMap: i(6260),
          rtlLocales: i(1969),
          enUSDictionary: i(8872),
          get localeUrl() {
            return o.isNode() ? "file://" + i(6488).resolve(2971, "..", "..", a) : r.createUrl(a)
          },
          get withCredentials() {
            return s.distUrlWithCredentials
          }
        });
      l._useMetric = !1, l.addEventListener(n.L10n.Events.LocaleChanged, (function () {
        var t = n.LangTag.parse(l.requestedLocaleId);
        l._useMetric = n.UseMetric.forLanguageTag(t)
      })), l.useMetric = function () {
        return this._useMetric
      }, s.setL10n(l), t.exports = l
    },
    9401: (t, e, i) => {
      var n = new (i(6665))({
        supportedLocales: i(2602),
        regionToScriptMap: i(6260),
        localesMap: i(3120)
      });
      t.exports = n
    },
    8790: (t, e, i) => {
      var n = i(9601),
        o = i(2114),
        s = n.MapRect,
        r = n.CoordinateSpan,
        a = n.MapPoint,
        l = i(7094),
        h = i(9425),
        c = i(2466),
        d = new r(.001, .001),
        u = new l(12, 12, 12, 12),
        p = "select",
        m = "deselect";

      function g(t) {
        this._map = t, this._items = []
      }
      g.checkShowItemsParameters = function (t, e) {
        return o.checkArray(t, "[MapKit] Map.showItems expects an array of items as its first parameter."), e = o.checkOptions(e, "object", "[MapKit] Map.showItems expects an object as optional second parameter."), Object.keys(e).forEach((function (t) {
          switch (t) {
            case "animate":
              break;
            case "padding":
              o.checkInstance(e.padding, l, "[MapKit] Map.showItems expects a Padding object for `options.padding`.");
              break;
            case "minimumSpan":
              o.checkInstance(e.minimumSpan, r, "[MapKit] Map.showItems expects a CoordinateSpan for `options.minimumSpan`.");
              break;
            case "cameraDistance":
              o.checkType(e.cameraDistance, "number", "[MapKit] Map.showItems expects a number for `options.cameraDistance`.");
              break;
            default:
              console.warn("[MapKit] `" + t + "` is not a valid option of Map.showItems.")
          }
        })), e
      }, g.getRegionForItems = function (t, e, i) {
        for (var o = i.padding || u, r = i.minimumSpan || d, c = 0, p = 0, m = 0, g = 0, _ = [], f = 0, y = e.length; f < y; ++f) {
          var v = e[f];
          if (v.map === t.public) {
            var w = v._impl._boundingRect || v._impl.boundingRectAtScale && v._impl.boundingRectAtScale(1);
            if (w) {
              if (v._impl.style) {
                var b = v._impl.style._impl.halfStrokeWidthAtResolution();
                c = Math.max(c, b), p = Math.max(p, b), m = Math.max(m, b), g = Math.max(g, b)
              }
              _.push(w)
            } else {
              v._impl.updateLayout(!0);
              var C = v._impl.delegate.paddingForAnnotation(v);
              c = Math.max(c, C.top), p = Math.max(p, C.right), m = Math.max(m, C.bottom), g = Math.max(g, C.left), _.push(new s(v._impl.x, v._impl.y, 0, 0))
            }
          }
        }
        if (0 === _.length) return null;
        o = new l(o.top + c, o.right + p, o.bottom + m, o.left + g);
        var k = function (t, e) {
          var i = t.toCoordinateRegion();
          if (i.span.latitudeDelta >= e.latitudeDelta && i.span.longitudeDelta >= e.longitudeDelta) return t;
          i.span.latitudeDelta = Math.max(i.span.latitudeDelta, e.latitudeDelta), i.span.longitudeDelta = Math.max(i.span.longitudeDelta, e.longitudeDelta);
          var o = i.span.latitudeDelta / 2,
            r = i.span.longitudeDelta / 2,
            l = new a(n.convertLongitudeToX(i.center.longitude - r), n.convertLatitudeToY(i.center.latitude + o)),
            h = new a(n.convertLongitudeToX(i.center.longitude + r), n.convertLatitudeToY(i.center.latitude - o));
          l.x > h.x && l.x--;
          return new s(l.x, l.y, Math.min(h.x - l.x, 1), h.y - l.y)
        }(h.boundingRectForSortedRects(_.sort((function (t, e) {
          return t.minX() - e.minX()
        }))), r);
        return t.padMapRect(k, o, i.cameraDistance)
      }, g.setRegionForItems = function (t, e, i) {
        if (t.ensureRenderingFrame().size.height <= 0 || t.ensureRenderingFrame().size.width <= 0) return !1;
        if (0 === e.length) return !0;
        var n = !!i.animate,
          o = g.getRegionForItems(t, e, i);
        return !o || (t.setVisibleMapRectAnimated(o, n), !0)
      }, g.prototype = {
        constructor: g,
        _map: null,
        _selectedItem: null,
        _selectionDistance: 10,
        get node() {
          return this._node
        },
        get items() {
          return this._items.filter(this.isItemExposed, this)
        },
        set items(t) {
          o.checkArray(t, "[MapKit] Map." + this.itemName + "s expected an array of " + this.itemName + "s, but got `" + t + "` instead."), t.forEach((function (t, e) {
            o.checkInstance(t, this.itemConstructor, "[MapKit] Map." + this.itemName + "s expected an " + this.itemName + " at index " + e + ", but got `" + t + "` instead.")
          }), this), t = t.filter((function (t) {
            return !t.map || t.map._impl === this._map || (console.warn("[MapKit] Map." + this.capitalizedItemName + "s: " + this.itemName + " is already in another map."), !1)
          }), this);
          var e = [].concat(this._items);
          t = [].concat(this._items.filter((function (t) {
            return !this.isItemExposed(t)
          }), this), t);
          for (var i = 0, n = 0, s = !1; i < t.length;) e[n] !== t[i] ? e[n] && -1 === t.indexOf(e[n]) ? (this.removedItem(e[n], !0), s = !0, n++) : (t[i].map && t[i].map._impl === this._map ? e.splice(e.indexOf(t[i]), 1) : (this.addedItem(t[i], !0), s = !0), i++) : (i++, n++);
          for (; n < e.length;) this.removedItem(e[n], !0), s = !0, n++;
          this._items = t, s && this.manyItemsChanged(t, !0)
        },
        get selectedItem() {
          return this._selectedItem
        },
        set selectedItem(t) {
          if (t !== this._selectedItem) {
            if (null != t && (o.checkInstance(t, this.itemConstructor, "[MapKit] Map.selected" + this.capitalizedItemName + " expected an " + this.itemName + " or `null`, but got `" + t + "` instead."), t.map !== this._map.public)) throw new Error("[MapKit] Map.selected" + this.capitalizedItemName + " cannot be set to an " + this.itemName + " that is not in the map.");
            if (this._selectedItem) {
              var e = this._selectedItem;
              this._selectedItem = null, e.selected = !1, this._map.selectionMayChange = !1, e.dispatchEvent(new c.Event(m)), delete this._map.selectionMayChange
            }
            t && (this._selectedItem = t, t.selected = !0, this._map.selectionMayChange = !1, t.dispatchEvent(new c.Event(p)), delete this._map.selectionMayChange)
          }
        },
        addItem: function (t, e) {
          return o.checkInstance(t, this.itemConstructor, "[MapKit] Map.add" + this.capitalizedItemName + " expected an " + this.itemName + ", but got `" + t + "` instead."), (t = this.addItemToList(t, !1, e)) && this.manyItemsAdded([t], !1), t
        },
        addItems: function (t) {
          o.checkArray(t, "[MapKit] Map.add" + this.capitalizedItemName + "s expected an array of " + this.itemName + "s, but got `" + t + "` instead.");
          var e = t.filter((function (t, e) {
            return o.checkInstance(t, this.itemConstructor, "[MapKit] Map.add" + this.capitalizedItemName + "s expected an " + this.itemName + " at index " + e + ", but got `" + t + "` instead."), !!this.addItemToList(t, !0)
          }), this);
          return e.length > 0 && this.manyItemsAdded(e, !0), e
        },
        shouldAddItem: function (t, e) {
          return t.map ? (t.map._impl !== this._map && console.warn("[MapKit] Map." + this.capitalizedItemName + (e ? "s" : "") + ": " + this.itemName + " is already in another map."), !1) : !t._impl.isMapFeature || (console.warn("[MapKit] Map." + this.capitalizedItemName + (e ? "s" : "") + ": " + this.itemName + " cannot be added to another map."), !1)
        },
        removeItem: function (t) {
          return o.checkInstance(t, this.itemConstructor, "[MapKit] Map.remove" + this.capitalizedItemName + " expected an " + this.itemName + ", but got `" + t + "` instead."), this.isItemExposed(t) ? t.map !== this._map.public ? console.warn("[MapKit] Map.remove" + this.capitalizedItemName + ": cannot remove " + this.itemName + " as it is not attached to this map.") : this.removeAnyItem(t) : console.warn("[MapKit] Map.remove" + this.capitalizedItemName + ": cannot remove " + this.itemName), t
        },
        removeAnyItem: function (t) {
          var e = this._items.indexOf(t);
          return e >= 0 && (this._items.splice(e, 1), this.removedItem(t), this.manyItemsRemoved([t], !1)), t
        },
        removeItems: function (t) {
          return o.checkArray(t, "[MapKit] Map.remove" + this.capitalizedItemName + "s expected an array of " + this.itemName + "s, but got `" + t + "` instead."), t.forEach((function (t, e) {
            o.checkInstance(t, this.itemConstructor, "[MapKit] Map.remove" + this.capitalizedItemName + "s expected an " + this.itemName + " at index " + e + ", but got `" + t + "` instead."), this.isItemExposed(t) ? t.map !== this._map.public ? console.warn("[MapKit] Map.remove" + this.capitalizedItemName + "s: cannot remove " + this.itemName + " at index " + e + " as it is not attached to this map.") : t._impl._toBeRemoved = !0 : console.warn("[MapKit] Map.remove" + this.capitalizedItemName + "s: cannot remove " + this.itemName + " at index " + e)
          }), this), this._items = this._items.filter((function (t) {
            return !t._impl._toBeRemoved
          })), t.forEach((function (t) {
            t._impl._toBeRemoved && (delete t._impl._toBeRemoved, this.removedItem(t, !0))
          }), this), t.length > 0 && this.manyItemsRemoved(t, !0), t
        },
        enabledItemCloseToPoint: function (t, e) {
          return this._previousPointForPickingItem && this._previousPointForPickingItem.equals(t) ? (e || (this._closeItemIndex = (this._closeItemIndex + 1) % this._closeItems.length), this._closeItems[this._closeItemIndex]) : (this._previousPointForPickingItem = t, this._closeItems = this._itemsCloseToPoint(t).filter((function (t) {
            return t.enabled
          })), this._closeItemIndex = !e && this._closeItems.length > 1 && this._closeItems[0].selected ? 1 : 0, this._closeItems[this._closeItemIndex])
        },
        get selectionMayChange() {
          return !this._map || this._map.selectionMayChange
        },
        addItemToList: function (t, e, i) {
          if (this.shouldAddItem(t, e)) return (void 0 === i || i < 0 || i > this._items.length) && (i = this._items.length), this._items.splice(i, 0, t), this.addedItem(t, e), t
        },
        addedItem: function (t, e) {
          "function" == typeof t._impl.setDelegate ? t._impl.setDelegate(this) : t._impl.delegate = this, t._impl.addedToMap && t._impl.addedToMap()
        },
        manyItemsAdded: function (t, e) { },
        removedItem: function (t) {
          t.selected = !1, delete t._impl.delegate, t._impl.removedFromMap && t._impl.removedFromMap()
        },
        manyItemsRemoved: function (t, e) { },
        manyItemsChanged: function (t, e) { },
        mapWasDestroyed: function () {
          delete this._map, this.removedReferenceToMap()
        },
        _node: null,
        _deletePreviousPointForPickingItem: function () {
          delete this._previousPointForPickingItem, delete this._closeItems, delete this._closeItemIndex
        },
        _itemsCloseToPoint: function (t) {
          var e = this._items.filter((function (t) {
            return t._impl.canBePicked()
          }));
          return 0 === e.length ? [] : this.pickableItemsCloseToPoint(e, t)
        }
      }, t.exports = g
    },
    757: t => {
      t.exports = {
        preprocessPoints: function (t, e) {
          var i = [];

          function n(t) {
            var e = i.length;
            t._index = e, i.push(t), s(e)
          }

          function o(t, e) {
            var n = i[t];
            return i[t] = i[e], i[e] = n, i[t]._index = t, i[e]._index = e, e
          }

          function s(t) {
            for (; t > 0;) {
              var e = Math.floor((t - 1) / 2);
              if (i[e]._area <= i[t]._area) return;
              t = o(t, e)
            }
          }

          function r(t) {
            for (; ;) {
              var e = 2 * t + 1,
                n = 2 * t + 2,
                s = i[t]._area,
                r = i[e] ? i[e]._area : 1 / 0,
                a = i[n] ? i[n]._area : 1 / 0;
              if (s <= r && s <= a) return;
              t = o(t, r <= s && r <= a ? e : n)
            }
          }

          function a(t) {
            var e = t._prev,
              i = t,
              n = t._next;
            return Math.abs((e.x - n.x) * (i.y - e.y) - (e.x - i.x) * (n.y - e.y)) / 2
          }

          function l(t, e) {
            var i = t._area;
            t._area = Math.max(a(t), e), t._area < i ? s(t._index) : r(t._index)
          }
          var h, c, d = t.length - 1;
          if (e && d > 1) {
            if (!t[d].equals(t[0])) {
              t.push(t[0].copy());
              var u = !0;
              ++d
            }
            var p = !0;
            t.unshift(t[d - 1].copy()), ++d
          }
          t[0]._area = t[d]._area = 1 / 0;
          for (var m = 1; m < d; ++m) {
            var g = t[m];
            g._prev = t[m - 1], g._next = t[m + 1], g._area = a(g), n(g)
          }
          for (p && t.shift(), u && t.pop(); i.length > 0;) {
            var _ = (h = void 0, c = void 0, h = i[0], c = i.pop(), i.length > 0 && (i[0] = c, c._index = 0, r(0)), h),
              f = _._prev,
              y = _._next;
            f._prev && (f._next = y, l(f, _._area)), y._next && (y._prev = f, l(y, _._area)), delete _._index, delete _._next, delete _._prev
          }
        },
        filterPointsAtScale: function (t, e) {
          var i = 1 / (e * e),
            n = t.filter((function (t) {
              return t._area > i
            }));
          if (2 === n.length) {
            var o = n[0].x - n[1].x,
              s = n[0].y - n[1].y;
            if (o * o + s * s < 1 * i) return []
          }
          return n
        }
      }
    },
    4935: t => {
      t.exports = {
        PointOfInterest: "PointOfInterest",
        Territory: "Territory"
      }
    },
    9455: (t, e, i) => {
      var n = i(9601),
        o = i(9328),
        s = i(8006).Tints,
        r = i(3658),
        a = i(2466),
        l = i(2114),
        h = i(3032),
        c = i(9425),
        d = i(7094),
        u = i(5193),
        p = i(3180),
        m = i(1232),
        g = i(9059),
        _ = i(1519),
        f = i(2406),
        y = i(3141),
        v = i(7900),
        w = i(3770),
        b = i(210),
        C = i(1593),
        k = i(4140),
        S = i(270),
        M = i(4937),
        E = i(1435),
        L = i(8790),
        T = i(4662),
        x = i(6074),
        A = i(8079),
        I = i(975),
        R = I.FeatureVisibility,
        O = i(6572),
        P = i(4935),
        D = n.CoordinateRegion,
        z = n.Coordinate,
        N = n.MapPoint,
        F = n.MapSize,
        U = n.MapRect,
        G = r.supportsTouches,
        B = new U(0, 0, 1, 1),
        Z = "mk-panning",
        K = "mk-dragging-cursor",
        W = "mk-dragging-annotation",
        j = "InitializedWithoutConfiguration",
        V = "Initialized",
        q = "ReadyWithoutConfiguration",
        H = "Ready",
        Y = "Rendered",
        X = "Switched",
        J = "Destroyed",
        Q = {
          padding: "rw",
          isScrollEnabled: "rw",
          isZoomEnabled: "rw",
          center: "rw",
          region: "rw",
          rotation: "rw",
          isRotationEnabled: "rw",
          showsCompass: "rw",
          visibleMapRect: "rw",
          tintColor: "rw",
          annotations: "rw",
          selectedAnnotation: "rw",
          overlays: "rw",
          selectedOverlay: "rw",
          showsUserLocation: "rw",
          tracksUserLocation: "rw",
          mapType: "rw",
          colorScheme: "rw",
          _allowWheelToZoom: "rw",
          _showsDefaultTiles: "rw",
          _internalAppDelegate: "rw",
          _landCoverStartUp: "rw",
          _startUpMode: "rw",
          showsPointsOfInterest: "rw",
          showsMapTypeControl: "rw",
          showsZoomControl: "rw",
          showsScale: "rw",
          showsUserLocationControl: "rw",
          pointOfInterestFilter: "rw",
          annotationForCluster: "rw",
          cameraDistance: "rw",
          cameraZoomRange: "rw",
          cameraBoundary: "rw",
          distances: "rw",
          tileOverlays: "rw",
          selectableMapFeatures: "rw",
          annotationForMapFeature: "rw",
          element: "ro",
          userLocationAnnotation: "ro"
        };

      function $(t, e, i) {
        h.state === h.States.READY ? this.state = V : this.state = j;
        try {
          (e = this._checkParent(e)) && (this._bootstrapSize = new k(e.offsetWidth, e.offsetHeight)), this.public = t, $.maps.push(this.public), i = l.checkOptions(i), this._checkOptions(i), "_internalAppDelegate" in i && (this.public._internalAppDelegate = i._internalAppDelegate), this._setDefaultState(i), this._setupScene(), this._setupRenderTree(), this._setupControllers(i);
          var n = "isRotationEnabled" in i;
          this._setIsRotationEnabled(!n || i.isRotationEnabled, n), "selectableMapFeatures" in i && (this.selectableMapFeatures = i.selectableMapFeatures), this._flushToDOM(e), this._handleOptions(i, e), this._setupListeners(), M.scheduleOnNextFrame(this)
        } catch (t) {
          throw t
        } finally {
          0
        }
      }
      $.maps = [];
      var tt = "mk-dark-mode",
        et = "zoom-start",
        it = "zoom-end",
        nt = "select",
        ot = "deselect",
        st = "region-change-start",
        rt = "region-change-end",
        at = "scroll-start",
        lt = "scroll-end",
        ht = "map-type-change",
        ct = "rotation-start",
        dt = "rotation-end",
        ut = "single-tap",
        pt = "double-tap",
        mt = "long-press",
        gt = "map-node-change",
        _t = "map-node-ready",
        ft = "complete",
        yt = "start-up-complete";

      function vt(t) {
        this.selected = t
      }

      function wt(t) {
        t.selected = !0, this._logWithMap(E.Events.AnnotationClick)
      }

      function bt(t, e, i, n) {
        if (!l.checkValueIsInEnum(t, e)) throw new Error("[MapKit] Unknown value for `" + i + "`. Choose from " + n + ".")
      }

      function Ct(t, e) {
        var i = new a.Event(t),
          n = e.locationInElement();
        return i.pointOnPage = new DOMPoint(n.x, n.y), i.domEvents = e.domEvents.slice(), i
      }
      $.MapTypes = I.MapTypes, $.Distances = I.Distances, $.ColorSchemes = s, $.prototype = {
        constructor: $,
        _showsUserLocation: !1,
        _tracksUserLocation: !1,
        _tintColor: "",
        _annotationForCluster: null,
        _emphasis: I.Emphasis.Standard,
        get padding() {
          return this._padding.copy()
        },
        set padding(t) {
          if (l.checkInstance(t, d, "[MapKit] The `padding` parameter passed to `Map.padding` is not a Padding."), !this._padding.equals(t)) {
            this._padding = t.copy();
            var e = this.ensureRenderingFrame();
            if (!e.equals(C.Zero)) {
              this.rotation = 0;
              var i = this._mapRectAccountingForPadding(),
                n = i.midX(),
                o = i.midY();
              this._setRenderingFrameValue(e);
              var s = this._mapRectAccountingForPadding(),
                r = n - s.midX(),
                a = o - s.midY(),
                h = new U(s.minX() + r, s.minY() + a, s.size.width, s.size.height);
              this.setVisibleMapRectAnimated(h, !1)
            }
            this.controlsLayer && this.controlsLayer.mapPaddingDidChange(this._adjustedPadding)
          }
        },
        get isScrollEnabled() {
          return this._mapNode.pannable
        },
        set isScrollEnabled(t) {
          this._mapNode.pannable = !!t, this._mapUserInteractionController.updateGestureEnableState()
        },
        get isZoomEnabled() {
          return this._mapNode.zoomable
        },
        set isZoomEnabled(t) {
          this._mapNode.zoomable = !!t, this.controlsLayer && this.controlsLayer.updateZoomControl(), this._mapUserInteractionController.updateGestureEnableState()
        },
        get snapsToIntegralZoomLevels() {
          return this._mapNode.snapsToIntegralZoomLevels
        },
        set snapsToIntegralZoomLevels(t) {
          this._mapNode.snapsToIntegralZoomLevels = !!t
        },
        get showsZoomControl() {
          return this._showsZoomControl
        },
        set showsZoomControl(t) {
          (t = !!t) !== this._showsZoomControl && (this._showsZoomControl = t, this.controlsLayer && (this.controlsLayer.updateZoomControl(), this.controlsLayer.updateScale()))
        },
        get showsScale() {
          return this._showsScale
        },
        set showsScale(t) {
          l.checkValueIsInEnum(t, R) ? t !== this._showsScale && (this._showsScale = t, this.controlsLayer && this.controlsLayer.updateScale()) : console.warn("[MapKit] value passed to `Map.showsScale` setter must be part of the mapkit.FeatureVisibility enum.")
        },
        get mapType() {
          return this._mapType
        },
        set mapType(t) {
          t !== this._mapType && (bt(t, $.MapTypes, "mapType", "Map.MapTypes"), this._setMapTypeAndEmphasis(t, this._emphasis))
        },
        getMapTypeWithEmphasis: function () {
          return this._mapType === $.MapTypes.Standard && this._emphasis === I.Emphasis.Muted ? $.MapTypes.MutedStandard : this._mapType
        },
        setMapTypeWithEmphasis: function (t) {
          var e = I.Emphasis.Standard;
          t === $.MapTypes.MutedStandard ? (t = $.MapTypes.Standard, e = I.Emphasis.Muted) : bt(t, $.MapTypes, "mapType", "Map.MapTypes"), e === this._emphasis && t === this._mapType || this._setMapTypeAndEmphasis(t, e)
        },
        _setMapTypeAndEmphasis: function (t, e) {
          this._mapType = t, this._emphasis = e, this._annotationsController.mapTypeDidChange(), this._updateMapNodeTintAndEmphasis(this._mapNode), this._mapNodeController.handleMapConfigurationChange(), this.controlsLayer && this.controlsLayer.update(), this.public.dispatchEvent(new a.Event(ht)), this._logWithMap(E.Events.MapTypeChange)
        },
        get distances() {
          return this._distances
        },
        set distances(t) {
          t !== this._distances && (bt(t, $.Distances, "distances", "Map.Distances"), this._distances = t, this.controlsLayer && this.controlsLayer.updateScale())
        },
        get colorScheme() {
          return this._colorScheme
        },
        set colorScheme(t) {
          t !== this._colorScheme && (bt(t, $.ColorSchemes, "colorScheme", "Map.ColorSchemes"), this._colorScheme = t, this._updateMapNodeTintAndEmphasis(this._mapNode))
        },
        get _allowWheelToZoom() {
          return this._mapNode.allowWheelToZoom
        },
        set _allowWheelToZoom(t) {
          this._mapNode.allowWheelToZoom = t
        },
        get _landCoverStartUp() {
          return "LandCover" === this._mapNodeController.startUpMode
        },
        set _landCoverStartUp(t) {
          this._mapNodeController.startUpMode = t ? "LandCover" : null
        },
        get _startUpMode() {
          return this._mapNodeController.startUpMode
        },
        set _startUpMode(t) {
          this._mapNodeController.startUpMode = t
        },
        get _showsTileInfo() {
          return this._mapNode._impl.debug
        },
        set _showsTileInfo(t) {
          this._mapNode._impl.debug = t
        },
        get _showsDefaultTiles() {
          return this._mapNode.showsDefaultTiles
        },
        set _showsDefaultTiles(t) {
          this._mapNode.showsDefaultTiles = t
        },
        get tileOverlays() {
          return this._mapNode.tileOverlays
        },
        set tileOverlays(t) {
          this._mapNode.tileOverlays = t, this.controlsLayer && this.controlsLayer.updateZoomControl()
        },
        addTileOverlay: function (t) {
          var e = this._mapNode.addTileOverlay(t);
          return this.controlsLayer && this.controlsLayer.updateZoomControl(), e
        },
        addTileOverlays: function (t) {
          var e = this._mapNode.addTileOverlays(t);
          return this.controlsLayer && this.controlsLayer.updateZoomControl(), e
        },
        removeTileOverlay: function (t) {
          var e = this._mapNode.removeTileOverlay(t);
          return this.controlsLayer && this.controlsLayer.updateZoomControl(), e
        },
        removeTileOverlays: function (t) {
          var e = this._mapNode.removeTileOverlays(t);
          return this.controlsLayer && this.controlsLayer.updateZoomControl(), e
        },
        get showsMapTypeControl() {
          return this._showsMapTypeControl
        },
        set showsMapTypeControl(t) {
          (t = !!t) !== this._showsMapTypeControl && (this._showsMapTypeControl = t, this.controlsLayer && this.controlsLayer.updateMapTypeControl())
        },
        get showsUserLocationControl() {
          return this._showsUserLocationControl
        },
        set showsUserLocationControl(t) {
          (t = !!t) !== this._showsUserLocationControl && (this._showsUserLocationControl = t, this.controlsLayer && (this.controlsLayer.updateUserLocationControl(), this.controlsLayer.updateScale()))
        },
        get showsPointsOfInterest() {
          return null === this.pointOfInterestFilter || null === this.pointOfInterestFilter._includes && 0 === this.pointOfInterestFilter._excludes.length
        },
        set showsPointsOfInterest(t) {
          if (t) {
            if (null === this.pointOfInterestFilter) return;
            this.pointOfInterestFilter = null
          } else {
            if (this.pointOfInterestFilter === O.filterExcludingAllCategories) return;
            this.pointOfInterestFilter = O.filterExcludingAllCategories
          }
        },
        get pointOfInterestFilter() {
          return this._mapNode.pointOfInterestFilter
        },
        set pointOfInterestFilter(t) {
          null !== t && l.checkInstance(t, O, "[MapKit] Value passed to `Map.pointOfInterestFilter` setter must be an instance of mapkit.PointOfInterestFilter."), this._mapNode.pointOfInterestFilter = t, this._mapNodeController.setPointOfInterestFilter(t)
        },
        get element() {
          return this.rootNode && this.rootNode.element
        },
        set element(t) {
          console.warn("[MapKit] The `element` property is read-only.")
        },
        get renderingMapRect() {
          return this._mapNode.visibleMapRect
        },
        get visibleMapRect() {
          return this._visibleMapRect || (this._visibleMapRect = this._mapRectAccountingForPadding()), this._visibleMapRect
        },
        set visibleMapRect(t) {
          this.setVisibleMapRectAnimated(t, !1)
        },
        setVisibleMapRectAnimated: function (t, e, i) {
          l.required(t, "[MapKit] Missing `visibleMapRect` parameter in call to `Map.setVisibleMapRectAnimated()`.").checkInstance(t, U, "[MapKit] The `visibleMapRect` parameter passed to `Map.setVisibleMapRectAnimated()` is not a MapRect.");
          var o = this.ensureRenderingFrame();
          if (0 === o.size.width || 0 === o.size.height) this._visibleMapRect = t;
          else {
            delete this._visibleMapRect;
            var s = this._visibleFrame,
              a = t,
              h = this._adjustedPadding;
            if (!h.equals(d.Zero)) {
              var c = o.size.width / s.size.width,
                u = o.size.height / s.size.height;
              a = new U(t.minX() - h.left * c * t.size.width, t.minY() - h.top * u * t.size.height, t.size.width * c, t.size.height * u)
            }
            var p = new N(t.midX(), t.midY()),
              m = n.zoomLevelForMapRectInViewport(a, o.size, n.tileSize);
            m = l.clamp(this._mapNode.snapsToIntegralZoomLevels ? r.getIntegralZoom(m) : m, this.minZoomLevel, this.maxZoomLevel);
            var g = Math.pow(2, Math.ceil(m)) * (n.tileSize * Math.pow(2, m - Math.ceil(m))),
              _ = new F(s.size.width / g, s.size.height / g);
            t = new U(p.x - _.width / 2, p.y - _.height / 2, _.width, _.height)
          }
          return e = null == e || !!e, this._setVisibleMapRect(t, e, i), delete this._delayedShowItems, this.public
        },
        get region() {
          return this.visibleMapRect.toCoordinateRegion()
        },
        set region(t) {
          this.setRegionAnimated(t, !1)
        },
        setRegionAnimated: function (t, e, i) {
          return l.required(t, "[MapKit] Tried to set `Map.region` property to a non-existent value.").checkInstance(t, D, "[MapKit] Region passed to `Map.region` setter is not a CoordinateRegion."), this.region.equals(t) || this.setVisibleMapRectAnimated(t.toMapRect(), e, i), this.public
        },
        get isRotationAvailable() {
          return "HYBRID" === h.forcedRenderingMode || "CLIENT" === h.forcedRenderingMode ? !h.didFallback && this.csrCapable : h.ready || h.didFallback ? h.canRunCSR && this.csrCapable : this.csrCapable
        },
        set isRotationAvailable(t) {
          console.warn("[MapKit] Map.isRotationAvailable is a read-only property")
        },
        get isRotationEnabled() {
          return this._mapNode.isRotationEnabled
        },
        set isRotationEnabled(t) {
          this._setIsRotationEnabled(t, !0)
        },
        get isRotationLocked() {
          return this._mapNode.isRotationLocked
        },
        get rotation() {
          return this._mapNode.rotation
        },
        set rotation(t) {
          this.setRotationAnimated(t, !1), this.controlsLayer && this.controlsLayer.updateRotationControl()
        },
        get showsCompass() {
          return this.usingCSR ? this._showsCompass : R.Hidden
        },
        set showsCompass(t) {
          l.checkValueIsInEnum(t, R) ? (this.isRotationEnabled || t !== R.Visible && t !== R.Adaptive || console.warn("[MapKit] The compass cannot be shown when `Map.isRotationEnabled` is false."), this._usingDefaultShowsCompassValue = !1, t !== this._showsCompass && (this._showsCompass = t, this.controlsLayer && this.controlsLayer.updateRotationControl())) : console.warn("[MapKit] value passed to `Map.showsCompass` setter must be part of the MapKit.FeatureVisibility enum.")
        },
        get usingCSR() {
          return !this._mapNodeController.usingSSR
        },
        setRotationAnimated: function (t, e, i) {
          if (this.isRotationAvailable) {
            if (l.required(t, "[MapKit] Tried to set `Map.rotation` property to a non-existent value."), "number" == typeof t && isFinite(t)) {
              var n = this._centerMapPoint(),
                o = t - this._mapNode.getRotation(),
                s = (e || null == e || !i) && this.mapCanStartRotating();
              if ((e || null == e) && s) {
                var r = this.camera.copy();
                r.rotateAroundCenter(n, o), this._mapNode.setCameraAnimated(r, !0, n)
              } else (s || i) && this._mapNode.rotateCameraAroundMapPoint(n, o), i || this.mapDidStopRotating();
              return this.public
            }
            console.warn("[MapKit] Argument for `Map.rotation` is not a finite number.")
          } else console.warn("[MapKit] Rotation is not available.")
        },
        get center() {
          return this._centerMapPoint().toCoordinate()
        },
        set center(t) {
          this.setCenterAnimated(t, !1)
        },
        setCenterAnimated: function (t, e, i) {
          l.required(t, "[MapKit] Tried to set `Map.center` property to a non-existent value.").checkInstance(t, z, "[MapKit] Value passed to `Map.center` setter is not a Coordinate object.");
          var n = this.ensureRenderingFrame();
          if (0 !== n.size.width && 0 !== n.size.height) {
            var o = this._offsetCenterWithPaddingAndRotation(t.toMapPoint(), -1);
            o && (t = o.toCoordinate())
          }
          return this._mapNode.setCenterAnimated(t, null == e || !!e), delete this._visibleMapRect, i || (this.tracksUserLocation = !1), this.public
        },
        get cameraZoomRange() {
          return this._mapNode.cameraZoomRange
        },
        set cameraZoomRange(t) {
          this.setCameraZoomRangeAnimated(t, !1)
        },
        setCameraZoomRangeAnimated: function (t, e) {
          return null != t && l.checkInstance(t, n.CameraZoomRange, "[MapKit] Expected a `mapkit.CameraZoomRange` object for `Map.cameraZoomRange`, but got `" + t + "` instead."), this._mapNode.setCameraZoomRangeAnimated(t, null == e || !!e), this.public
        },
        get cameraDistance() {
          return this._mapNode.getCurrentCameraDistance()
        },
        set cameraDistance(t) {
          this.setCameraDistanceAnimated(t, !1)
        },
        setCameraDistanceAnimated: function (t, e) {
          if (!(t >= 0)) throw new Error("[MapKit] Expected a number for Map.cameraDistance, but got `" + t + "` instead");
          return this._mapNode.setCameraDistanceAnimated(t, null == e || !!e), this.public
        },
        get cameraBoundary() {
          var t = this._cameraBoundary;
          return t ? {
            region: t.toCoordinateRegion ? t.toCoordinateRegion() : t.copy(),
            mapRect: t.toMapRect ? t.toMapRect() : t.copy()
          } : null
        },
        set cameraBoundary(t) {
          this.setCameraBoundaryAnimated(t, !1)
        },
        setCameraBoundaryAnimated: function (t, e) {
          var i = null;
          if (null == t) delete this._cameraBoundary;
          else if (t instanceof D) i = t.toMapRect(), this._cameraBoundary = t.copy();
          else {
            if (!(t instanceof U)) throw new Error("[MapKit] `Map.cameraBoundaryRect` expected a CoordinateRegion or a MapRect, but got `" + t + "` instead.");
            i = t, this._cameraBoundary = i.copy()
          }
          var n = this._centerMapPoint();
          return this._mapNode.setCameraBoundaryAnimated(i, null == e || !!e), this.tracksUserLocation && !this._mapNode.isMapPointWithinBounds(n) && (this.tracksUserLocation = !1), this.public
        },
        get overlays() {
          return this._overlaysController.items
        },
        set overlays(t) {
          this._overlaysController.items = t
        },
        get selectedOverlay() {
          return this._overlaysController.selectedItem
        },
        set selectedOverlay(t) {
          this._overlaysController.selectedItem = t
        },
        addOverlay: function (t) {
          return this._overlaysController.addItem(t)
        },
        addOverlays: function (t) {
          return this._overlaysController.addItems(t), t
        },
        removeOverlay: function (t) {
          return this._overlaysController.removeItem(t)
        },
        removeOverlays: function (t) {
          return this._overlaysController.removeItems(t)
        },
        topOverlayAtPoint: function (t) {
          l.checkInstance(t, window.DOMPoint, "[MapKit] Map.topOverlayAtPoint expected a DOMPoint, but got `" + t + "` instead.");
          var e = this.rootNode.convertPointFromPage(t),
            i = this._overlaysController.pickableItemsCloseToPoint(this.overlays, e, 0),
            n = this.selectedOverlay;
          return n && i.indexOf(n) > 0 ? n : i[0]
        },
        overlaysAtPoint: function (t) {
          l.checkInstance(t, window.DOMPoint, "[MapKit] Map.overlaysAtPoint expected a DOMPoint, but got `" + t + "` instead.");
          var e = this.rootNode.convertPointFromPage(t);
          return this._overlaysController.pickableItemsCloseToPoint(this.overlays, e, 0).reverse()
        },
        get annotations() {
          return this._annotationsController.items
        },
        set annotations(t) {
          this._annotationsController.items = t
        },
        get selectedAnnotation() {
          return this._annotationsController.selectedItem
        },
        set selectedAnnotation(t) {
          this._annotationsController.selectedItem = t
        },
        addAnnotation: function (t) {
          return this._annotationsController.addItem(t)
        },
        addAnnotations: function (t) {
          return this._annotationsController.addItems(t)
        },
        removeAnnotation: function (t) {
          return this._annotationsController.removeItem(t)
        },
        removeAnnotations: function (t) {
          return this._annotationsController.removeItems(t)
        },
        showItems: function (t, e) {
          var i = new A(t).getFlattenedItemList();
          e = L.checkShowItemsParameters(i, e);
          var n = [],
            o = [];
          return i.forEach((function (t) {
            t instanceof T && !t.map && (t._impl._map = this.public, n.push(t)), t instanceof x && this._annotationsController.preAddedAnnotation(t) && o.push(t)
          }), this), this.isRooted() && L.setRegionForItems(this, i, e) || (this._delayedShowItems = [i, e]), n.forEach((function (t) {
            delete t._impl._map
          })), o.forEach(this._annotationsController.resetAnnotation.bind(this._annotationsController)), this._addItems(i), t
        },
        addItems: function (t) {
          var e = new A(t).getFlattenedItemList();
          return this._addItems(e), t
        },
        removeItems: function (t) {
          var e = new A(t).getFlattenedItemList(),
            i = [],
            n = [];
          return e.forEach((function (t, e) {
            if (!(t instanceof T || t instanceof x)) throw new Error("[MapKit] Map.removeItems expected an Annotation, Overlay, ItemCollection, or Array of valid items at index " + e + ", but got `" + t + "` instead.");
            t instanceof T ? i.push(t) : n.push(t)
          }), this), this.removeOverlays(i), this.removeAnnotations(n), t
        },
        annotationsInMapRect: function (t) {
          return this._annotationsController.annotationsInMapRect(t)
        },
        updateSize: function (t) {
          return console.warn("[MapKit] Map resizing is now automatic, the Map.updateSize() method has been deprecated and will be removed in a future version."), this.public
        },
        convertCoordinateToPointOnPage: function (t) {
          l.checkInstance(t, z, "[MapKit] Map.convertCoordinateToPointOnPage expected a Coordinate, but got `" + t + "` instead.");
          var e = this.camera.transformMapPoint(t.toMapPoint()),
            i = this.rootNode.convertPointToPage(e);
          return new window.DOMPoint(i.x, i.y)
        },
        convertPointOnPageToCoordinate: function (t) {
          l.checkInstance(t, window.DOMPoint, "[MapKit] Map.convertPointOnPageToCoordinate expected a DOMPoint, but got `" + t + "` instead.");
          var e = this.camera.transformGestureCenter(this.rootNode.convertPointFromPage(new b(t.x, t.y))),
            i = this.renderingMapRect.origin;
          return new z(n.convertYToLatitude(i.y + e.y / this.worldSize), n.convertXToLongitude(i.x + e.x / this.worldSize))
        },
        get showsUserLocation() {
          return this._userLocationController.showsUserLocation
        },
        set showsUserLocation(t) {
          (t = !!t) !== this.showsUserLocation && (this._userLocationController.showsUserLocation = t, t || (this._removeUserLocationDisplay(), this.tracksUserLocation = !1), this.showsUserLocationControl && this.controlsLayer && (this.controlsLayer.updateUserLocationControl(), this.controlsLayer.updateScale()))
        },
        get userLocationAnnotation() {
          return this._annotationsController.userLocationAnnotation
        },
        get tracksUserLocation() {
          return this._userLocationController.tracksUserLocation
        },
        set tracksUserLocation(t) {
          (t = !!t) !== this.tracksUserLocation && (this._userLocationController.tracksUserLocation = t, this._mapNode.staysCenteredDuringZoom = t, t ? this.showsUserLocation = !0 : this.userLocationAnnotation || (this.showsUserLocation = !1), this._firstCameraUpdateToTrackUserLocationPending = t, this._updateCameraToTrackUserLocation(this._userLocationController.userLocation), this._userLocationController.tracksUserLocation === t && (this.controlsLayer && this.controlsLayer.updateUserLocationControl(), this._userLocationTrackingDelegate && "function" == typeof this._userLocationTrackingDelegate.mapUserLocationTrackingDidChange && this._userLocationTrackingDelegate.mapUserLocationTrackingDidChange(this.public)))
        },
        get tintColor() {
          return this._tintColor
        },
        set tintColor(t) {
          if (t !== this._tintColor) {
            if (null != t) {
              if (l.checkType(t, "string", "[MapKit] Expected a string value for Map.tintColor, but got `" + t + "` instead"), "" !== t && !r.isValidCSSColor(t)) return void console.warn("[MapKit] value passed to `Map.tintColor` is not a valid color value. Ignoring: " + t);
              this._tintColor = t
            } else delete this._tintColor;
            this.controlsLayer && this.controlsLayer.update()
          }
        },
        get tintColorForControls() {
          return r.darkColorScheme(this.mapNodeTint) ? "" : this._tintColor
        },
        get minZoomLevel() {
          return this._mapNode.minZoomLevel
        },
        get maxZoomLevel() {
          return this._mapNode.maxZoomLevel
        },
        get zoomLevel() {
          return this._mapNode.zoomLevel
        },
        set zoomLevel(t) {
          this._mapNode.zoomLevel = t
        },
        get worldSize() {
          return n.pointsPerAxis(this._mapNode.zoomLevel)
        },
        get camera() {
          return this._mapNodeController.node.camera
        },
        get cameraIsPanning() {
          return this._mapNode.cameraIsPanning
        },
        get cameraIsZooming() {
          return this._mapNode.cameraIsZooming
        },
        get cameraIsRotating() {
          return this._mapNode.cameraIsRotating
        },
        get cameraIsAnimating() {
          return this._mapNode.cameraIsAnimating
        },
        get cameraIsMoving() {
          return this.cameraIsPanning || this.cameraIsZooming || this.cameraIsRotating || this.cameraIsAnimating
        },
        get _mapNode() {
          return this._mapNodeController.node
        },
        get csrCapable() {
          return this._mapNodeController.csrCapable
        },
        destroy: function () {
          if (this.state !== J) {
            this.state = J, this.removeAnnotations(this.annotations), this.removeOverlays(this.overlays), this._stopStabilizationTimeout(), this._linearZoomController.stop(), this.showsUserLocation && this._removeUserLocationDisplay(), this.controlsLayer && (this.controlsLayer.mapWasDestroyed(), this.controlsLayer = null), this._mapUserInteractionController.mapWasDestroyed(), this._overlaysController.mapWasDestroyed(), this._annotationsController.mapWasDestroyed(), this._userLocationController.mapWasDestroyed(), this._linearZoomController._delegate = null, h.removeEventListener(h.Events.Changed, this), m.removeEventListener(m.Events.LocaleChanged, this), this._boundDevicePixelRatioDidChange && (this._dppxMediaQueryList.removeListener(this._boundDevicePixelRatioDidChange), this._dppxMediaQueryList = null, this._boundDevicePixelRatioDidChange = null), this._iframe && (this._iframe.removeEventListener("load", this), this._iframe.contentWindow && this._iframe.contentWindow.removeEventListener("resize", this), this.element.removeChild(this._iframe), this._iframe = null), this._resizeObserver && (this._resizeObserver.disconnect(), this._resizeObserver = null), this._mapNodeController.destroy(), this._mapRoot.remove(), this._mapRoot = null, this._scene.destroy(), this._scene = null, this._removePrintListener(), this.element && this.element.parentNode && this.element.parentNode.removeChild(this.element), this.rootNode.remove(), this.rootNode = null;
            var t = $.maps.indexOf(this.public);
            t >= 0 && $.maps.splice(t, 1)
          } else console.warn("[MapKit] Map was already destroyed.")
        },
        adjustMapItemPoint: function (t) {
          return this._mapNode.adjustMapItemPoint(t)
        },
        get annotationForCluster() {
          return this._annotationForCluster
        },
        set annotationForCluster(t) {
          if (null == t) delete this._annotationForCluster;
          else {
            if ("function" != typeof t) throw new Error("[MapKit] annotationForCluster must be a function or null");
            this._annotationForCluster = t
          }
        },
        selectionMayChange: !0,
        get selectableMapFeatures() {
          return this._selectableMapFeatures ? h.ready && (h.didFallback || !h.canRunCSR) || !this.csrCapable || "SERVER" === h.forcedRenderingMode ? [] : this._selectableMapFeatures.slice() : []
        },
        set selectableMapFeatures(t) {
          if (null != t) {
            l.checkArray(t, "[MapKit] Map.selectableMapFeatures expected an array of values, but got `" + t + "` instead."), t.forEach((function (t) {
              bt(t, P, "MapFeatureType", "mapkit.MapFeatureType")
            }));
            var e = [];
            Object.values(P).forEach((function (i) {
              -1 !== t.indexOf(i) && e.push(i)
            })), 0 !== e.length ? ((!h.ready || !h.didFallback && h.canRunCSR) && this.csrCapable && "SERVER" !== h.forcedRenderingMode || console.warn("[MapKit] Selectable map features is not available."), this._selectableMapFeatures = e) : delete this._selectableMapFeatures
          } else delete this._selectableMapFeatures
        },
        get annotationForMapFeature() {
          return this._annotationForMapFeature
        },
        set annotationForMapFeature(t) {
          if (null == t) delete this._annotationForMapFeature;
          else {
            if ("function" != typeof t) throw new Error("[MapKit] annotationForMapFeature must be a function or null");
            this._annotationForMapFeature = t
          }
        },
        handleEvent: function (t) {
          switch (t.type) {
            case h.Events.Changed:
              this._configurationDidBecomeAvailable();
              break;
            case y.EVENTS.ZOOM_START:
              this._handleZoomStartEvent(t);
              break;
            case y.EVENTS.ZOOM_END:
              this._handleZoomEndEvent(t);
              break;
            case m.Events.LocaleChanged:
              this._handleLocaleChange(t);
              break;
            case "load":
              this._iframeDidLoad();
              break;
            case "resize":
              this._sizeDidChange()
          }
        },
        elementShouldPreventDragstart: function (t) {
          return !this._annotationsController.isElementInCustomCallout(t)
        },
        elementWantsDefaultBrowserBehavior: function (t, e, i) {
          if (e && i && ("touchstart" === e.type || "pointerdown" === e.type && "touch" === e.pointerType)) {
            if (1 === i && !this.isScrollEnabled) return !0;
            if (2 === i && !this.isZoomEnabled && !this.isRotationEnabled) return !0
          }
          return this._annotationsController.isElementInCallout(t)
        },
        getEventTargetFromSubShadowDOM: function (t) {
          var e = t.touches ? t.touches[0].target : t.target;
          return r.supportsShadowDOM && e === this._annotationsController.node.element && this._annotationsController.getShadowDOMTargetFromEvent(t) || e
        },
        tileAccessForbidden: function () {
          h.accessKeyHasExpired()
        },
        previousMapDidFinishRendering: function (t) {
          this.state !== J && this.public.dispatchEvent(new a.Event(yt))
        },
        mapDidFinishRendering: function (t) {
          this.state !== J && (this.state = Y, this._controlsLayer || setTimeout(function () {
            this._insertControlsLayer(), this._updateInitialControlsLayerState()
          }.bind(this)), this._mapNodeController.handleMapRendered(), this.addWaitingAnnotations(), this._startStabilizationTimeoutIfNeeded())
        },
        mapCanStartPanning: function (t) {
          return this._panningWasPrevented ? (delete this._panningWasPrevented, !1) : !(this.tracksUserLocation && this.cameraIsZooming || this._annotationsController.dragging || this._isInitialInteractionTargetInUIElement() || !this.public.dispatchEvent(new a.Event(at)))
        },
        mapWillStartPanning: function (t) {
          this._stopStabilizationTimeout(), this.tracksUserLocation = !1, this.rootNode.classList.add(Z), this.rootNode.classList.add(K)
        },
        mapWillStopPanning: function (t) {
          this.rootNode.classList.remove(K)
        },
        mapDidStopPanning: function (t) {
          this._startStabilizationTimeoutIfNeeded(), this.rootNode.classList.remove(Z), this.public.dispatchEvent(new a.Event(lt))
        },
        mapCanStartZooming: function (t) {
          return !(this._isInitialInteractionTargetInUIElement() || !this.public.dispatchEvent(new a.Event(et)))
        },
        mapWillStartZooming: function (t, e, i, n) {
          this._stopStabilizationTimeout(), n && (this.tracksUserLocation = !1), this._logWithMap(E.Events.Zoom, {
            eventValue: e
          })
        },
        mapDidStopZooming: function (t) {
          this._startStabilizationTimeoutIfNeeded(), this.public.dispatchEvent(new a.Event(it)), this.controlsLayer && this.controlsLayer.scaleDidChange()
        },
        mapCameraWillChange: function (t, e) {
          this.mapNodeCameraBeforeChange = t.camera
        },
        mapCameraDidChange: function (t, e) {
          if (this.state !== J) {
            var i = this.mapNodeCameraBeforeChange;
            delete this.mapNodeCameraBeforeChange, delete this._visibleMapRect, this._mapNodeController.mapCameraDidChange(), this._overlaysController.mapCameraDidChange(), this._annotationsController.updateVisibleAnnotations(), this.controlsLayer && (this.controlsLayer.scaleDidChange(), i && i.rotation === t.camera.rotation || this.controlsLayer.updateRotationControl())
          }
        },
        mapCameraChangesWillStart: function (t, e) {
          this._zoomLevelWhenCameraChangeStarted = this.zoomLevel, this.public.dispatchEvent(new a.Event(st))
        },
        mapCameraChangesDidEnd: function (t) {
          this.state !== J && (this._zoomLevelWhenCameraChangeStarted !== this.zoomLevel && this.controlsLayer && this.controlsLayer.zoomLevelDidChange(), delete this._zoomLevelWhenCameraChangeStarted, this.public.dispatchEvent(new a.Event(rt)))
        },
        mapMinAndMaxZoomLevelsDidChange: function (t) {
          this.controlsLayer && this.controlsLayer.zoomLevelDidChange()
        },
        mapCanStartRotating: function (t) {
          return this.public.dispatchEvent(new a.Event(ct))
        },
        mapRotationDidChange: function (t) {
          this.controlsLayer && this.controlsLayer.updateRotationControl()
        },
        mapDidStopRotating: function (t) {
          this.public.dispatchEvent(new a.Event(dt))
        },
        mapTransformCenter: function (t) {
          return this._centerMapPoint()
        },
        userWillTap: function (t) {
          var e = t.locationInElement();
          if (this._isInitialInteractionTargetInUIElement()) r.supportsTouches && (this._delayedTapFunction = this._elementWasTapped.bind(this, this._mapUserInteractionController.initialEventTargetForCurrentInteraction));
          else if (!this._annotationsController.selectedItem || !this._annotationsController.selectedItem._impl.alwaysSelected) {
            var i = this.rootNode.convertPointFromPage(e),
              n = this._annotationsController.enabledItemCloseToPoint(i);
            if (n) this._delayedTapFunction = wt.bind(this, n);
            else {
              var o = this._overlaysController.enabledItemCloseToPoint(i);
              if (o) this._delayedTapFunction = vt.bind(o, !0);
              else {
                if (this._selectableMapFeatures && this._mapNode.getMapFeatureRegions) {
                  for (var s, a = this._mapNode.getMapFeatureRegions(), l = -1 !== this._selectableMapFeatures.indexOf(P.PointOfInterest), h = -1 !== this._selectableMapFeatures.indexOf(P.Territory), c = 0; c < a.length; c++) {
                    var d = a[c];
                    if ((l || "poi" !== d.featureType) && (h || "territory" !== d.featureType)) {
                      for (var u = this.camera.transformMapPoint(new N(d.position[0], d.position[1])), p = 0; p < d.rects.length; p++) {
                        var m = d.rects[p],
                          g = m.size,
                          _ = u.x + m.offset[0],
                          f = u.y + m.offset[1];
                        if (g[0] < 44 && (_ -= (44 - g[0]) / 2, g[0] = 44), g[1] < 44 && (f -= (44 - g[1]) / 2, g[1] = 44), _ < i.x && i.x < _ + g[0] && f < i.y && i.y < f + g[1]) {
                          s = d;
                          break
                        }
                      }
                      if (s) break
                    }
                  }
                  if (s) return void this._annotationsController.mapFeatureDidSelect(s)
                }
                var y = Ct(ut, t);
                this._delayedTapFunction = function () {
                  this.public.dispatchEvent(y), y.defaultPrevented || (this._annotationsController.selectedItem = null, this._overlaysController.selectedItem = null)
                }.bind(this)
              }
            }
          }
        },
        shouldDelaySingleTap: function () {
          return this.isZoomEnabled || this.public._listeners && (this.public._listeners[ut] && this.public._listeners[ut].length > 0 || this.public._listeners[pt] && this.public._listeners[pt].length > 0)
        },
        userDidTap: function (t) {
          this._delayedTapFunction && (this._delayedTapFunction(), delete this._delayedTapFunction)
        },
        userCanceledTap: function (t) {
          delete this._delayedTapFunction
        },
        userDidDoubleTap: function (t) {
          var e = t.modifierKeys.alt;
          (!this.isZoomEnabled || e && this.zoomLevel === this._mapNode.minZoomLevel || !e && this.zoomLevel === this._mapNode.maxZoomLevel) && this.public.dispatchEvent(Ct(pt, t))
        },
        userDidLongPress: function (t) {
          if (this._isInitialInteractionTargetInUIElement()) return !1;
          var e = t.locationInElement(),
            i = this._annotationsController.enabledItemCloseToPoint(this.rootNode.convertPointFromPage(e), !0);
          if (!i) {
            var n = Ct(mt, t);
            return this.public.dispatchEvent(n), n.defaultPrevented && (this._panningWasPrevented = !0), r.supportsTouches
          }
          return i._impl.isDraggable() && !this.cameraIsMoving ? (this._annotationsController.startDraggingAnnotation(i, e), !0) : r.supportsTouches ? (wt.call(this, i), !0) : r.supportsTouches
        },
        userMayStartPanningAfterLongPress: function () {
          delete this._panningWasPrevented
        },
        userDidPanAfterLongPress: function (t) {
          this._annotationsController.annotationDraggingDidChange(t)
        },
        userDidStopPanningAfterLongPress: function (t) {
          this._annotationsController.annotationDraggingDidEnd(t)
        },
        linearZoomControllerDidZoom: function (t) {
          this.cameraIsZooming && (this.zoomLevel = t, (t <= this.minZoomLevel && !this._linearZoomController.zoomsIn || t >= this.maxZoomLevel && this._linearZoomController.zoomsIn) && this._mapNode.cameraDidStopZooming())
        },
        linearZoomControllerDidStop: function () {
          this._mapNode.cameraDidStopZooming()
        },
        userLocationDidChange: function (t) {
          this._updateUserLocationDisplay(t.target), this.controlsLayer && this.controlsLayer.userLocationDidChange(t.target), this.tracksUserLocation && this._updateCameraToTrackUserLocation(t.target), this.public.dispatchEvent(t)
        },
        userLocationDidError: function (t) {
          this._updateUserLocationDisplay(t.target), this.controlsLayer && this.controlsLayer.userLocationDidError(t.target), this.public.dispatchEvent(t)
        },
        get mapNodeTint() {
          var t = this._mapNodeController && this._mapNodeController.node;
          return t ? t.tint : $.ColorSchemes.Light
        },
        isRooted: function () {
          return this.element && this.element.ownerDocument.body.contains(this.element)
        },
        stopDraggingAnnotation: function () {
          this._mapUserInteractionController._stopDraggingAnnotation()
        },
        translateVisibleMapRectAnimated: function (t, e) {
          var i = this.visibleMapRect;
          this._setVisibleMapRect(new U(i.minX() + t.x / this.worldSize, i.minY() + t.y / this.worldSize, i.size.width, i.size.height), !!e)
        },
        translateCameraAnimated: function (t, e) {
          this._mapNode.setCameraAnimated(this.camera.translate(t), !!e)
        },
        setCameraAnimated: function (t, e) {
          this._mapNode.setCameraAnimated(t, !!e)
        },
        shouldWaitForTilesAndControls: function () {
          return this.state !== Y || !this.controlsLayer || this.controlsLayer.controlsPending
        },
        ensureRenderingFrame: function () {
          return this._renderingFrame || new C
        },
        ensureVisibleFrame: function () {
          return this._visibleFrame || new C
        },
        annotationDraggingWillStart: function () {
          this.rootNode.classList.add(W), this._insertControlsLayer(), this._updateInitialControlsLayerState(), this.controlsLayer.classList.add(W), this.controlsLayer.canShowTooltips = !1
        },
        annotationDraggingDidEnd: function () {
          this.rootNode.classList.remove(W), this.controlsLayer && (this.controlsLayer.classList.remove(W), this.controlsLayer.canShowTooltips = !0)
        },
        get useMetric() {
          switch (this.distances) {
            case $.Distances.Adaptive:
              return m.useMetric();
            case $.Distances.Metric:
              return !0;
            case $.Distances.Imperial:
              return !1
          }
        },
        get isCompassHidden() {
          return this.showsCompass === R.Hidden || r.supportsTouches && this.showsCompass === R.Adaptive && 0 === this.rotation || !this.isRotationEnabled
        },
        compassDraggingWillStart: function () {
          var t = this.mapCanStartRotating();
          return t && this.rootNode.classList.add(K), t
        },
        compassRotationWillStart: function () {
          return this._mapNodeController.node.compassRotationWillStart()
        },
        compassDraggingDidEnd: function () {
          this.mapDidStopRotating(), this._mapNodeController.node.compassRotationDidEnd(), this.rootNode.classList.remove(K)
        },
        compassRotationDidEnd: function () {
          this._mapNodeController.node.compassRotationDidEnd()
        },
        panningDuringAnnotationDrag: function () {
          this._annotationsController.mapPanningDuringAnnotationDrag()
        },
        padMapRect: function (t, e, i) {
          l.checkType(e, "object", "[MapKit] padding must be an object with any of `top`, `left`, `bottom`, `right`"), ["top", "left", "bottom", "right"].forEach((function (t) {
            if (t in e) {
              var i = e[t];
              if ("number" != typeof i || i < 0) throw new Error("[MapKit] property `" + t + "` of padding must be a number >= 0; got `" + i + "`")
            } else e[t] = 0
          }));
          var o = this.ensureRenderingFrame().size,
            s = l.log2(Math.min((o.width - (e.left + e.right)) / (t.size.width * n.tileSize), (o.height - (e.top + e.bottom)) / (t.size.height * n.tileSize))),
            r = n.pointsPerAxis(s),
            a = c.padMapRect(t, {
              top: e.top / r,
              left: e.left / r,
              bottom: e.bottom / r,
              right: e.right / r
            });
          if (void 0 !== i && i >= 0) {
            s = this._mapNode.zoomLevelForCameraDistanceAtY(i, a.midY());
            var h = r / n.pointsPerAxis(s);
            return a.scale(h, new n.MapPoint(a.midX(), a.midY()))
          }
          return a
        },
        supportsLabelRegions: function () {
          return !this._mapNodeController.usingSSR
        },
        createLabelRegion: function () {
          return this._mapNode.createLabelRegion()
        },
        updatedLabelRegion: function () {
          this._mapNode.updatedLabelRegion()
        },
        unregisterLabelRegion: function (t) {
          this._mapNode.unregisterLabelRegion(t)
        },
        _addItems: function (t) {
          var e = [];
          return t.forEach((function (t, i) {
            if (!(t instanceof T || t instanceof x)) throw new Error("[MapKit] Map.addItems expected an Annotation, Overlay, ItemCollection, or Array of valid items at index " + i + ", but got `" + t + "` instead.");
            t.map || (t instanceof T ? this.addOverlay(t) : e.push(t))
          }), this), this.addAnnotations(e), t
        },
        _configurationDidBecomeAvailable: function (t) {
          var e = t && this.state === V;
          t || (this.state === j ? (this.state = V, e = !0) : this.state === q && (this.state = H, e = !0)), this._mapNodeController.configurationDidBecomeAvailable(t), e && this._logWithMap(E.Events.MapsLoad), this.controlsLayer && this.controlsLayer.update(), this.public._internalAppDelegate && "function" == typeof this.public._internalAppDelegate.networkConfigurationUpdated && this.public._internalAppDelegate.networkConfigurationUpdated({
            madabaDomains: h.madabaDomains,
            tileGroup: h.tileGroup,
            accessKey: h.accessKey
          })
        },
        _setupScene: function () {
          this._scene = new o.Scene, this._scene.element.className = "rt-root", this._scene.element.setAttribute("aria-hidden", "true")
        },
        _checkOptions: function (t) {
          l.checkType(t, "object", "[MapKit] The `options` object is invalid."), Object.keys(t).forEach((function (t) {
            var e = Q[t];
            "rw" === e || ("ro" === e ? console.warn("[MapKit] `" + t + "` is read-only and can't be set on a Map.") : console.warn("[MapKit] `" + t + "` is not a valid property of Map."))
          }))
        },
        _checkParent: function (t) {
          if (null != t) {
            var e = "string" == typeof t ? document.getElementById(t) : t;
            if (!e || !l.isElement(e)) throw new Error("[MapKit] `parent` must either be a DOM element or its ID.");
            return e
          }
        },
        _setDefaultState: function (t) {
          this._showsScale = R.Hidden, this._visibleMapRect = B, this._padding = new d, this._adjustedPadding = new d, this._showsCompass = R.Adaptive, this._usingDefaultShowsCompassValue = !0, this._distances = $.Distances.Adaptive, this._showsZoomControl = "showsZoomControl" in t ? !!t.showsZoomControl : !G, this._showsMapTypeControl = "showsMapTypeControl" in t ? !!t.showsMapTypeControl : !G, this._showsUserLocationControl = "showsUserLocationControl" in t && !!t.showsUserLocationControl;
          var e = t.mapType || $.MapTypes.Standard;
          bt(e, $.MapTypes, "mapType", "Map.MapTypes"), e === $.MapTypes.MutedStandard ? (this._emphasis = I.Emphasis.Muted, this._mapType = $.MapTypes.Standard) : (this._emphasis = I.Emphasis.Standard, this._mapType = e);
          var i = t.colorScheme || $.ColorSchemes.Light;
          bt(i, $.ColorSchemes, "colorScheme", "Map.ColorSchemes"), this._colorScheme = i
        },
        _setIsRotationEnabled: function (t, e) {
          "boolean" == typeof t ? (this.isRotationAvailable ? this._mapNode.isRotationEnabled = t : e && t && console.warn("[MapKit] Rotation can't be enabled because it's not available."), this.controlsLayer && this.controlsLayer.updateRotationControl(), this._mapUserInteractionController.updateGestureEnableState()) : console.warn("[MapKit] Value passed to `Map.isRotationEnabled` is not a Boolean.")
        },
        _setupRenderTree: function () {
          var t = document.createElement("div");
          t.className = "mk-map-view", t.appendChild(this._scene.element), this.rootNode = new S.Node(t)
        },
        _setupControllers: function (t) {
          M.scheduleInBackground(this._insertControlsLayer.bind(this)), M.scheduleInBackground(this._updateInitialControlsLayerState.bind(this)), this._overlaysController = new g(this), this._scene.addChild(this._overlaysController.node), this._annotationsController = new _(this), this._scene.addChild(this._annotationsController.sceneGraphNode), this._userLocationController = new v(this), this._mapNodeController = new f(this, t), this._linearZoomController = new u(this._mapNode.snapsToIntegralZoomLevels, this), this._mapUserInteractionController = new p(this.rootNode.element, this)
        },
        getControlBounds: function () {
          return this.controlsLayer ? this.controlsLayer.controlBounds() : []
        },
        _insertControlsLayer: function () {
          this.state === J || this.controlsLayer || (this.controlsLayer = new w(this), this._mapRoot.addChild(this.controlsLayer))
        },
        _updateInitialControlsLayerState: function () {
          this.state === J || this._updateInitialControlsLayerStateCalled || (this._updateInitialControlsLayerStateCalled = !0, this.controlsLayer.update(), this.controlsLayer.mapPaddingDidChange(this._adjustedPadding))
        },
        _handleOptions: function (t, e) {
          t.showsScale && (this.showsScale = t.showsScale), t.showsCompass && (this.showsCompass = t.showsCompass), t.padding && (this.padding = t.padding), t.cameraZoomRange && (this.cameraZoomRange = t.cameraZoomRange), t.cameraBoundary && (this.cameraBoundary = t.cameraBoundary), t.visibleMapRect ? this.visibleMapRect = t.visibleMapRect : t.region ? this.region = t.region : (t.center && (this.center = t.center), "cameraDistance" in t && (this.cameraDistance = t.cameraDistance)), t.rotation && (this.rotation = t.rotation);
          var i = [],
            n = !t.visibleMapRect && !t.region && !t.center && e;
          if (t.overlays && (l.checkArray(t.overlays, "[MapKit] Map constructor overlays option expected an array of overlays, but got `" + t.annotations + "` instead."), n ? i.push.apply(i, t.overlays) : this.overlays = t.overlays), t.annotations && (l.checkArray(t.annotations, "[MapKit] Map constructor annotations option expected an array of annotations, but got `" + t.annotations + "` instead."), n ? i.push.apply(i, t.annotations) : this.annotations = t.annotations), i.length > 0) {
            var o = {};
            "cameraDistance" in t && (o.cameraDistance = t.cameraDistance), this.showItems(i, o)
          }
          t.selectedOverlay && (this.selectedOverlay = t.selectedOverlay), t.selectedAnnotation && (this.selectedAnnotation = t.selectedAnnotation), t.distances && (this.distances = t.distances), this.tintColor = t.tintColor, this.showsUserLocation = t.showsUserLocation, this.tracksUserLocation = t.tracksUserLocation, t.tileOverlays && (this.tileOverlays = t.tileOverlays), t.annotationForCluster && (this.annotationForCluster = t.annotationForCluster), t.annotationForMapFeature && (this.annotationForMapFeature = t.annotationForMapFeature)
        },
        _flushToDOM: function (t) {
          this._addMapToParent(t), M.flush(), this._ensureContainerIsPositioned()
        },
        _addMapToParent: function (t) {
          null != t && (t.appendChild(this.element), this._bootstrapSize.width && this._bootstrapSize.height && this._updateRenderingFrameSize(this._bootstrapSize), delete this._bootstrapSize)
        },
        performScheduledUpdate: function () {
          if (this.state !== J) {
            0;
            var t = this._mapNode.camera.zoom;
            t % 1 != 0 && (this.state === j || this.state === V) && ("SERVER" === h.forcedRenderingMode || h.ready && (h.didFallback || !h.canRunCSR) || !this.csrCapable || "HYBRID" === h.forcedRenderingMode || !this._mapNodeController.knownGoodRendering || !this._mapNodeController.manageableMap || "PointOfInterests" === this._mapNodeController.startUpMode) && this._mapNode.setZoomLevelAnimated(r.getIntegralZoom(t)), this.state === j ? this.state = q : this.state === V && (this.state = H), this._loadResizeDetector()
          }
        },
        _loadResizeDetector: function () {
          if (!this._iframe && !this._resizeObserver) {
            if (window.ResizeObserver) return this._resizeObserver = new window.ResizeObserver(function (t) {
              this._sizeDidChange()
            }.bind(this)), this._resizeObserver.observe(this.rootNode.element), void this._resizeDetectorDidInstall();
            this._iframe = r.htmlElement("iframe", {
              tabindex: -1,
              "aria-hidden": !0
            }), this._iframe.addEventListener("load", this), this.element.insertBefore(this._iframe, this._scene.element)
          }
        },
        _updateUserLocationDisplay: function (t) {
          this._annotationsController.updateUserLocationAnnotation(t), this._overlaysController.updateUserLocationAccuracyRingOverlay(t)
        },
        _removeUserLocationDisplay: function () {
          this._annotationsController.removeUserLocationAnnotation(), this._overlaysController.removeUserLocationAccuracyRingOverlay()
        },
        _updateCameraToTrackUserLocation: function (t) {
          var e, i;
          if (this.tracksUserLocation && this.showsUserLocation && t.coordinate) {
            if (this._mapNode.isMapPointWithinBounds(t.coordinate.toMapPoint()))
              if (this._firstCameraUpdateToTrackUserLocationPending && this.zoomLevel < 9.5) {
                var o = 14;
                if (t.location.accuracy > 0) {
                  var s = 5 * t.location.accuracy * n.mapUnitsPerMeterAtLatitude(t.location.latitude),
                    r = new U(0, 0, s, s),
                    a = this.ensureVisibleFrame().size;
                  o = Math.max(this.zoomLevel, n.zoomLevelForMapRectInViewport(r, a, n.tileSize))
                }
                e = this._mapRectForCenterAndZoomLevel(t.coordinate.toMapPoint(), o), this._userLocationTrackingDelegate && "function" == typeof this._userLocationTrackingDelegate.mapRegionWillChangeToTrackUserLocation && (i = e.toCoordinateRegion(), this._userLocationTrackingDelegate.mapRegionWillChangeToTrackUserLocation(this.public, i), e = i.toMapRect()), this._mapNode.setCameraAnimated(this.camera.withNewMapRect(e), !0, !0)
              } else this._userLocationTrackingDelegate && "function" == typeof this._userLocationTrackingDelegate.mapRegionWillChangeToTrackUserLocation ? (i = (e = this._mapRectForCenterAndZoomLevel(t.coordinate.toMapPoint(), this.zoomLevel)).toCoordinateRegion(), this._userLocationTrackingDelegate.mapRegionWillChangeToTrackUserLocation(this.public, i), this._mapNode.setCameraAnimated(this.camera.withNewMapRect(e), !0, !0)) : this.setCenterAnimated(t.coordinate, !0, !0);
            else this.setCenterAnimated(t.coordinate, !0, !0), this._userLocationController.tracksUserLocation = !1, this._mapNode.staysCenteredDuringZoom = !1, this.controlsLayer && this.controlsLayer.updateUserLocationControl();
            delete this._firstCameraUpdateToTrackUserLocationPending
          }
        },
        _updateRenderingFrameFromElement: function () {
          var t = this.rootNode.element,
            e = t.offsetWidth,
            i = t.offsetHeight;
          0 !== e && 0 !== i && this._updateRenderingFrameSize(new k(e, i))
        },
        _setRenderingFrameValue: function (t) {
          this._renderingFrame = t, this._visibleFrame = t;
          var e = this._adjustedPadding.copy(),
            i = this._adjustedPadding = this._adjustedPaddingForMapSize(t.size);
          i.equals(d.Zero) || (this._visibleFrame = new C(t.origin.x + i.left, t.origin.y + i.top, t.size.width - i.left - i.right, t.size.height - i.top - i.bottom)), !i.equals(e) && this.controlsLayer && this.controlsLayer.mapPaddingDidChange(i)
        },
        _adjustedPaddingForMapSize: function (t) {
          var e = new k(Math.min(I.MapSizes.minimumSizeToShowLogo.width, t.width), Math.min(I.MapSizes.minimumSizeToShowLogo.height, t.height)),
            i = this._padding.copy();
          i.top < 0 && (i.top = 0), i.left < 0 && (i.left = 0), i.bottom < 0 && (i.bottom = 0), i.right < 0 && (i.right = 0);
          var n = i.left + i.right,
            o = i.top + i.bottom,
            s = n + e.width - t.width,
            r = o + e.height - t.height;
          if (s > 0 && n > 0) {
            var a = (n - s) / n;
            i.left *= a, i.right *= a
          }
          if (r > 0 && o > 0) {
            var l = (o - r) / o;
            i.top *= l, i.bottom *= l
          }
          return i
        },
        _iframeDidLoad: function () {
          try {
            this._iframe.contentWindow.addEventListener("resize", this)
          } catch (t) {
            console.warn("[MapKit] Map resize detection is disabled when loaded in a sandboxed iframe.")
          }
          this._resizeDetectorDidInstall()
        },
        _resizeDetectorDidInstall: function () {
          var t = this._visibleMapRect && this._visibleMapRect.copy(),
            e = this.rotation,
            i = this._padding && !this._padding.equals(d.Zero);
          this._ensureContainerIsPositioned(), this._sizeDidChange(), t && i && (t.size.width > 0 || t.size.height > 0 ? (this.setVisibleMapRectAnimated(t, !1), e && this.setRotationAnimated(e, !1)) : this.setCenterAnimated(new N(t.midX(), t.midY()).toCoordinate()))
        },
        _sizeDidChange: function () {
          this._printMediaQueryList && this._printMediaQueryList.matches || this._updateRenderingFrameFromElement()
        },
        _updateRenderingFrameSize: function (t) {
          var e = !this._renderingFrame;
          0 === t.width || 0 === t.height || !e && this._renderingFrame.size.equals(t) || (this._setRenderingFrameValue(new C(0, 0, t.width, t.height)), this._scene.size = t, this._mapRoot.size = t, this._mapNodeController.updateSize(t), this._delayedShowItems && (L.setRegionForItems(this, this._delayedShowItems[0], this._delayedShowItems[1]), delete this._delayedShowItems), this.controlsLayer && this.controlsLayer.sizeDidChange(), this._annotationsController.mapSizeDidUpdate())
        },
        _mapRectForCenterAndZoomLevel: function (t, e) {
          var i = this.ensureVisibleFrame().size,
            o = n.pointsPerAxis(e),
            s = i.width / o,
            r = i.height / o;
          return new U(t.x - s / 2, t.y - r / 2, s, r)
        },
        _isInitialInteractionTargetInUIElement: function () {
          var t = this._mapUserInteractionController.initialEventTargetForCurrentInteraction;
          return !!t && (!!this._annotationsController.isElementInCallout(t) || !(!this.controlsLayer || !this.controlsLayer.element.contains(t)))
        },
        _handleZoomStartEvent: function (t) {
          t.zoomIn && this.zoomLevel >= this.maxZoomLevel || !t.zoomIn && this.zoomLevel <= this.minZoomLevel || this._linearZoomController.start(this.zoomLevel, t.zoomIn) && this._mapNode.cameraWillStartZooming(I.ZoomTypes.Button)
        },
        _handleZoomEndEvent: function (t) {
          this._linearZoomController.stop()
        },
        _centerMapPoint: function () {
          if (0 !== this.rotation) {
            var t = this.renderingMapRect,
              e = new N(t.midX(), t.midY()),
              i = this._offsetCenterWithPaddingAndRotation(e, 1);
            if (i) return i
          }
          var n = this.visibleMapRect;
          return new N(n.midX(), n.midY())
        },
        _offsetCenterWithPaddingAndRotation: function (t, e) {
          var i = 2 * e * this.worldSize,
            n = (this._adjustedPadding.right - this._adjustedPadding.left) / i,
            o = (this._adjustedPadding.bottom - this._adjustedPadding.top) / i;
          if (0 !== n || 0 !== o) {
            var s = -this.rotation / 180 * Math.PI;
            return new N(t.x - n * Math.cos(s) + o * Math.sin(s), t.y - n * Math.sin(s) - o * Math.cos(s))
          }
        },
        _setVisibleMapRect: function (t, e, i) {
          i || (this.tracksUserLocation = !1);
          var n = t,
            o = this._adjustedPadding,
            s = this.ensureRenderingFrame(),
            r = this.ensureVisibleFrame();
          o.equals(d.Zero) || r.equals(C.Zero) || (n = new U(t.minX() - o.left / r.size.width * t.size.width, t.minY() - o.top / r.size.height * t.size.height, t.size.width * (s.size.width / r.size.width), t.size.height * (s.size.height / r.size.height))), this._mapNode.setVisibleMapRectAnimated(n, e)
        },
        _ensureContainerIsPositioned: function () {
          var t = this.rootNode.element;
          "static" === t.ownerDocument.defaultView.getComputedStyle(t).position && (t.style.position = "relative")
        },
        didInsertNewMapNode: function (t) {
          t.delegate = this, this.state === Y && (this.state = X), this._updateMapRoot(t), this._updateMapNodeTintAndEmphasis(t), window.setTimeout(function () {
            this.public.dispatchEvent(new a.Event(gt))
          }.bind(this), 0)
        },
        didReconfigureMapNode: function (t) {
          t.snapsToIntegralZoomLevels && t.zoomLevel % 1 != 0 && !t.cameraIsAnimating && (t.zoomLevel = r.getIntegralZoom(t.zoomLevel)), this._linearZoomController && (this._linearZoomController.snapsToIntegralZoomLevels = t.snapsToIntegralZoomLevels), this.controlsLayer && this.controlsLayer.updateZoomControl()
        },
        didFinishMapNodeInitialization: function (t) {
          if (t.customCanvas) {
            var e = this._scene.element;
            t.customCanvas.setAttribute("aria-hidden", "true"), e.parentNode.insertBefore(t.customCanvas, e)
          } else this._scene.addChild(t, 0)
        },
        mapNodeReady: function (t) {
          window.setTimeout(function () {
            var e = new a.Event(_t);
            e.usingCSR = t, this.public.dispatchEvent(e), this._logWithMap(E.Events.MapNodeReady)
          }.bind(this), 0), this.controlsLayer && this.controlsLayer.updateRotationControl(), this._annotationsController.mapSupportForLabelRegionsChanged()
        },
        _updateMapRoot: function (t) {
          this._mapRoot && this._mapRoot.remove(), this._mapRoot = this.rootNode.insertBefore(new S.Node(t.element), this.rootNode.firstChild), t.element.className = "mk-map-node-element", this._mapRoot.size = t.size = this._scene.size, this._mapRoot.addChild(this._annotationsController.node), this.controlsLayer && this._mapRoot.addChild(this.controlsLayer)
        },
        _updateMapNodeTintAndEmphasis: function (t) {
          var e = this.tint = this._mapType === $.MapTypes.Standard ? this._colorScheme : $.ColorSchemes.Dark,
            i = this._colorScheme;
          this._mapType === $.MapTypes.Hybrid && (i = $.ColorSchemes.Light), t.setTintAndEmphasis(e, i, this._emphasis), this._mapNodeController && this._mapNodeController.setTintAndEmphasis(e, i, this._emphasis), this.controlsLayer && this.controlsLayer.update(), this._annotationsController.mapNodeTintWasSet(e), this.rootNode.classList.toggle(tt, r.darkColorScheme(e)), this._annotationsController.node.classList.toggle(tt, r.darkColorScheme(e))
        },
        overlaySelectionDidChange: function (t) {
          t.selected && (this._annotationsController.selectedItem = null);
          var e = new a.Event(t.selected ? nt : ot);
          e.overlay = t, this.selectionMayChange = !1, this.public.dispatchEvent(e), delete this.selectionMayChange
        },
        annotationSelectionDidChange: function (t) {
          t.selected && (this._overlaysController.selectedItem = null), this.selectionMayChange = !1, this.dispatchEventWithAnnotation(t.selected ? nt : ot, t), delete this.selectionMayChange
        },
        dispatchEventWithAnnotation: function (t, e, i) {
          var n = new a.Event(t);
          if (n.annotation = e, i)
            for (var o in i) n[o] = i[o];
          this.public.dispatchEvent(n)
        },
        addWaitingAnnotations: function () {
          this.shouldWaitForTilesAndControls() || this._annotationsController.addWaitingAnnotations(this._dispatchCompleteEvent.bind(this))
        },
        _dispatchCompleteEvent: function () {
          this._mapNode.fullyRendered && this.public.dispatchEvent(new a.Event(ft))
        },
        _handleLocaleChange: function (t) {
          this._mapNodeController.handleMapConfigurationChange(), this._annotationsController.rtl = t.locale.rtl, this._annotationsController.updateUserLocationAnnotation(this._userLocationController.userLocation, !0);
          var e = this.ensureRenderingFrame();
          0 !== e.size.width && 0 !== e.size.height && this._setRenderingFrameValue(e)
        },
        _elementWasTapped: function (t) {
          for (; null !== t; t = t.parentNode)
            if ("a" === (e = t).localName || "button" === e.localName || "input" === e.localName && "button" === e.type) return void t.click();
          var e
        },
        _devicePixelRatioDidChange: function () {
          this._scene.needsDisplay = !0, this.controlsLayer && this.controlsLayer.devicePixelRatioDidChange(), this._annotationsController.devicePixelRatioDidChange(), this._mapNode.devicePixelRatioDidChange() || this._mapNodeController.handleRecreate()
        },
        _mapRectAccountingForPadding: function () {
          var t = this.renderingMapRect;
          if (this._adjustedPadding.equals(d.Zero)) return t.copy();
          var e = this.ensureVisibleFrame(),
            i = this.ensureRenderingFrame();
          return new U(t.minX() + this._adjustedPadding.left / i.size.width * t.size.width, t.minY() + this._adjustedPadding.top / i.size.height * t.size.height, t.size.width * (e.size.width / i.size.width), t.size.height * (e.size.height / i.size.height))
        },
        _setupListeners: function () {
          h.state === h.States.READY && this._configurationDidBecomeAvailable(!0), h.addEventListener(h.Events.Changed, this), m.activeLocale && this._handleLocaleChange({
            locale: m.activeLocale
          }), m.addEventListener(m.Events.LocaleChanged, this), this._boundDevicePixelRatioDidChange = this._devicePixelRatioDidChange.bind(this), this._dppxMediaQueryList = window.matchMedia("(-webkit-device-pixel-ratio: 1)"), this._dppxMediaQueryList.addListener(this._boundDevicePixelRatioDidChange), this._boundPrintMediaQueryChanged = this._printMediaQueryChanged.bind(this), this._printMediaQueryList = window.matchMedia("print"), this._printMediaQueryList.addListener(this._boundPrintMediaQueryChanged)
        },
        _removePrintListener: function () {
          this._printMediaQueryList.removeListener(this._boundPrintMediaQueryChanged), this._boundPrintMediaQueryChanged = null, this._printMediaQueryList = null
        },
        _printMediaQueryChanged: function () {
          var t = this._mapNode;
          this._printMediaQueryList.matches ? (this.rootNode.element.style.background = this.rootNode.element.parentNode.dataset.mapPrintingBackground, t.fullyRendered ? this._ensureMapCenterDuringPrint(!0) : (t.opacity = 0, this._annotationsController.addWaitingAnnotations()), this._insertControlsLayer(), this._updateInitialControlsLayerState(), this._mapNodeController.handlePrintMatch(), M.flush()) : (this._mapNodeController.handlePrintUnmatch(), t.opacity = 1, this.rootNode.element.style.background = "", this._ensureMapCenterDuringPrint(!1))
        },
        _ensureMapCenterDuringPrint: function (t) {
          var e = [this._scene.element];
          this._mapNode.customCanvas && e.push(this._mapNode.customCanvas), e.forEach((function (e) {
            if (t) {
              var i = this._scene.size;
              e.style.left = "50%", e.style.marginLeft = "-" + i.width / 2 + "px", e.style.top = "50%", e.style.marginTop = "-" + i.height / 2 + "px"
            } else e.style.left = "", e.style.marginLeft = "", e.style.top = "", e.style.marginTop = ""
          }), this)
        },
        _mapStabilizationTimeout: null,
        _startStabilizationTimeoutIfNeeded: function () {
          this._mapNode && this._mapNode.fullyRendered && !this.cameraIsMoving && this._mapNode.cssBackgroundProperty && (this._stopStabilizationTimeout(), this._mapStabilizationTimeout = window.setTimeout(this._updatePrintingBackground.bind(this), 500))
        },
        _stopStabilizationTimeout: function () {
          this._mapStabilizationTimeout && (window.clearTimeout(this._mapStabilizationTimeout), this._mapStabilizationTimeout = null)
        },
        _updatePrintingBackground: function () {
          this._mapNode && this._mapNode.fullyRendered && this.isRooted() && (this.rootNode.element.parentNode.dataset.mapPrintingBackground = this._mapNode.cssBackgroundProperty)
        },
        _logWithMap: function (t, e) {
          if (this.state !== J) {
            var i = {
              map: this,
              eventTarget: E.EventTarget
            };
            if (e)
              for (var n in e) i[n] = e[n];
            E.log(t, i)
          }
        }
      }, t.exports = $
    },
    2406: (t, e, i) => {
      var n = i(3032),
        o = i(2114),
        s = i(4937),
        r = i(3658),
        a = i(3306).SceneGraphMapNode,
        l = i(3306).SyrupMapNode,
        h = i(2640),
        c = i(8552),
        d = i(8877).XHRLoader,
        u = i(8877).Priority,
        p = i(975).FeatureVisibility,
        m = i(6572),
        g = i(1435),
        _ = i(8006).FallbackType,
        f = i(9985),
        y = 1,
        v = 5,
        w = "mapkit.SpileTestResults",
        b = {
          sg_grid: {
            "global-configuration": "sg_ready",
            upgrade: "syrup_insert"
          },
          sg_insert: {
            "global-configuration": "sg_ready",
            upgrade: "syrup_insert",
            recreate: "sg_insert"
          },
          syrup_insert: {
            "global-configuration": "syrup_need_spile",
            fallback: "sg_insert",
            recreate: "syrup_insert"
          },
          syrup_need_spile: {
            "spile-load": "syrup_init",
            fallback: "sg_insert",
            recreate: "syrup_insert"
          },
          syrup_init: {
            "global-configuration": "syrup_network_stalled",
            fallback: "sg_insert",
            recreate: "syrup_insert",
            "syrup-complete": "syrup_ready"
          },
          syrup_network_stalled: {
            "global-configuration": "syrup_network_stalled",
            fallback: "sg_insert",
            recreate: "syrup_insert",
            "syrup-complete": "syrup_ready"
          },
          sg_ready: {
            "global-configuration": "sg_ready",
            upgrade: "syrup_insert",
            recreate: "sg_insert",
            "map-configuration": "sg_ready"
          },
          syrup_ready: {
            "global-configuration": "syrup_ready",
            fallback: "sg_insert",
            recreate: "syrup_insert",
            "map-configuration": "syrup_ready",
            "print-match": "syrup_printing"
          },
          syrup_printing: {
            "print-unmatch": "syrup_ready"
          }
        };

      function C(t, e) {
        this._state = null, this._map = t, this._previousNode = null, this.node = null, this._initialOptions = e, this._cachedWebGLCheck = null, this.startUpMode = "LandCover", "_landCoverStartUp" in e ? this.startUpMode = e._landCoverStartUp ? "LandCover" : null : "_startUpMode" in e && (this.startUpMode = e._startUpMode), this.hasSpile = null, this._previousCanRunCSR = !1;
        this._updateState("sg_grid")
      }

      function k(t) {
        return btoa(t)
      }

      function S(t) {
        if (o.supportsLocalStorage) try {
          return window.localStorage.getItem(t)
        } catch (t) {
          return
        }
      }

      function M(t) {
        try {
          return JSON.parse(t)
        } catch (t) {
          return
        }
      }
      C.prototype = {
        constructor: C,
        get defaultSpileURL() {
          return this._defaultSpileURL || (this._defaultSpileURL = h.createSyrupUrl()), this._defaultSpileURL
        },
        set defaultSpileURL(t) {
          this._defaultSpileURL = t
        },
        get usingSSR() {
          return "sg_insert" === this._state || "sg_ready" === this._state
        },
        get usingAdvancedAPIs() {
          return !0
        },
        get manageableMap() {
          var t = this._map.ensureRenderingFrame(),
            e = .2 * this._gpuInfo.MAX_RENDERBUFFER_SIZE;
          return t.size.width <= e && t.size.height <= e
        },
        get csrCapable() {
          return "HYBRID" === n.forcedRenderingMode || "CLIENT" === n.forcedRenderingMode || this._webglCheckResult.shouldTryCSR && !this.knownBadRendering
        },
        get shouldDynamicallyLoadSyrup() {
          return this._webglCheckResult.shouldTryCSR
        },
        get knownGoodRendering() {
          return !!this._cachedSpileResult && !!this._cachedSpileResult.pass
        },
        get knownBadRendering() {
          return !!this._cachedSpileResult && !this._cachedSpileResult.pass
        },
        get _webglCheckResult() {
          if (null === this._cachedWebGLCheck) {
            var t = this._map.ensureRenderingFrame().size;
            this._cachedWebGLCheck = c(t.width, t.height)
          }
          return this._cachedWebGLCheck
        },
        get _gpuInfo() {
          return this._webglCheckResult && this._webglCheckResult.webGL ? this._webglCheckResult.webGL.gpuInfo : {
            MAX_RENDERBUFFER_SIZE: 0,
            VERSION: "unknown"
          }
        },
        get gpuKey() {
          return k(this._gpuInfo.VERSION)
        },
        get _cachedSpileResult() {
          var t = S(w);
          if (t) {
            var e = M(t);
            if (e) return e[this.gpuKey]
          }
        },
        get renderingMode() {
          var t = "CLIENT";
          return this.usingSSR ? t = "SERVER" : this._switchedToLoCSR && (t = "HYBRID"), t
        },
        configurationDidBecomeAvailable: function (t) {
          var e = this._previousCanRunCSR,
            i = n.canRunCSR;
          this._previousCanRunCSR = i, !e || i || this.usingSSR ? !e && i ? this.handleUpgrade() : t || this.handleGlobalConfigurationChange() : this.handleFallback(_.CONFIG_CHANGE)
        },
        forceSyrup: function () {
          this.hasSpile = null, this._transition("upgrade")
        },
        updateSize: function (t) {
          this.node.size = t, this._previousNode && (this._previousNode.size = t)
        },
        destroy: function () {
          this.node.removeEventListener("reconfigured", this), this.node.destroy(), this.node.delegate = null, this.node = null, this._previousNode && (this._previousNode.destroy(), this._previousNode = null)
        },
        handleEvent: function (t) {
          "reconfigured" === t.type && (this._switchedToLoCSR = this.node.snapsToIntegralZoomLevels, this._map.didReconfigureMapNode(this.node))
        },
        handleGlobalConfigurationChange: function () {
          this._transition("global-configuration")
        },
        handleSpileLoad: function () {
          this._transition("spile-load")
        },
        handleFallback: function (t) {
          var e = t === _.SPILE && t || n.didFallback && n.fallbackType || t;
          e && this._logFallback(e), this._transition("fallback")
        },
        handleUpgrade: function () {
          this._transition("upgrade")
        },
        handleRecreate: function () {
          this._transition("recreate")
        },
        handleMapConfigurationChange: function () {
          this._transition("map-configuration"), this._previousNode && this._previousNode instanceof a && this._previousNode.configuration && (this._previousNode.configuration = n.types[this._map.mapType])
        },
        handleSyrupComplete: function () {
          this._transition("syrup-complete")
        },
        handlePrintMatch: function () {
          this._transition("print-match")
        },
        handlePrintUnmatch: function () {
          this._transition("print-unmatch")
        },
        handleMapRendered: function () {
          this.node instanceof l && (this.node.forcedSnapsToIntegralZoomLevels = !1, this._removePreviousMapNode(!0), n.forcedRenderingMode || this._cachedSpileResult || s.scheduleInBackground(this.spileRun.bind(this), s.Priority.Low))
        },
        setPointOfInterestFilter: function (t) {
          this._previousNode && (this._previousNode.pointOfInterestFilter = t)
        },
        setTintAndEmphasis: function (t, e, i) {
          this._previousNode && this._previousNode.setTintAndEmphasis(t, e, i)
        },
        mapCameraDidChange: function () {
          this._previousNode && this._previousNode.setCameraAnimated(this.node.camera.copy())
        },
        _transition: function (t) {
          var e = b[this._state][t];
          e && this._updateState(e)
        },
        _updateState: function (t) {
          this._state = t;
          var e = this["_enter_" + t];
          "function" == typeof e && e.call(this)
        },
        _loadSpileIfNeeded: function (t) {
          var e = null,
            i = function () {
              e && (e.removeEventListener("error", i), e.removeEventListener("load", i), e = null), this.hasSpile = !!window.Spile && !!window.Spile.Syrup, t.call(this, this.hasSpile)
            }.bind(this);
          null != this.hasSpile ? t.call(this, this.hasSpile) : "function" == typeof window.Spile ? i() : ((e = document.head.appendChild(document.createElement("script"))).addEventListener("error", i), e.addEventListener("load", i), e.src = this.defaultSpileURL, e.crossOrigin = r.getCorsAttribute(n.syrupUrlWithCredentials))
        },
        _insertSceneGraphNode: function () {
          this.usingSSR && (this.node.isRotationEnabled = !1);
          var t = new a;
          this._insertNewMapNode(t), this._map.didFinishMapNodeInitialization(t)
        },
        _enter_sg_grid: function () {
          this._insertSceneGraphNode(), n.ready && !n.canRunCSR && this._updateState("sg_ready")
        },
        _enter_sg_insert: function () {
          this._insertSceneGraphNode(), n.ready && this._updateState("sg_ready")
        },
        _enter_syrup_insert: function () {
          var t = new l;
          t.pendingConfigurationUpdates = {}, this._insertNewMapNode(t), n.state === n.States.READY && this._updateState("syrup_need_spile")
        },
        _insertNewMapNode: function (t) {
          var e = this._initialOptions || {};
          this._initialOptions || this.node._impl._cameraWillChange(this.node, !1), this.node ? (this._removePreviousMapNode(), this._previousNode = this.node, this._previousNode.deactivate(), this.node.migrateStateTo(t), this.node.removeEventListener("reconfigured", this)) : (t.allowWheelToZoom = "_allowWheelToZoom" in e && !!e._allowWheelToZoom, t.pannable = !("isScrollEnabled" in e) || !!e.isScrollEnabled, t.zoomable = !("isZoomEnabled" in e) || !!e.isZoomEnabled, "pointOfInterestFilter" in e ? ("showsPointsOfInterest" in e && console.warn("[MapKit] `showsPointsOfInterest` is ignored because `pointOfInterestFilter` is set."), null !== e.pointOfInterestFilter && o.checkInstance(e.pointOfInterestFilter, m, "[MapKit] Unknown value for `pointOfInterestFilter`. It must be an instance of mapkit.PointOfInterestFilter."), t.pointOfInterestFilter = e.pointOfInterestFilter) : "showsPointsOfInterest" in e && (e.showsPointsOfInterest ? t.pointOfInterestFilter = null : t.pointOfInterestFilter = m.filterExcludingAllCategories), t.showsDefaultTiles = !("_showsDefaultTiles" in e) || !!e._showsDefaultTiles), this.node = t, this.node.addEventListener("reconfigured", this), this._map.didInsertNewMapNode(t), this._initialOptions ? delete this._initialOptions : this.node._impl._cameraDidChange(this.node, !1)
        },
        _removePreviousMapNode: function (t) {
          this._previousNode && (t ? new f.Opacity({
            node: this._previousNode,
            duration: 150,
            from: 1,
            to: 0,
            done: this._removePreviousMapNode.bind(this, !1)
          }).begin() : (this._previousNode.destroy(!0), this._previousNode.remove(), this._previousNode = null))
        },
        _enter_syrup_need_spile: function () {
          if (this.shouldDynamicallyLoadSyrup) {
            if (this.knownBadRendering && !n.forcedRenderingMode) return this.handleFallback(_.CACHE), void this._loadSpileIfNeeded(function (t) {
              this.node && t && (this.isSpileResultValid(this._cachedSpileResult) || (this.invalidateSpileCache(), s.scheduleInBackground(this.spileRun.bind(this), s.Priority.Low)))
            }.bind(this));
            if (this.startUpMode && this._previousNode && this._previousNode instanceof a && !this._previousNode.configuration)
              if (0 !== this.node.rotation) 0;
              else {
                var t = "PointOfInterests" === this.startUpMode;
                this._previousNode.snapsToIntegralZoomLevels = t, this._previousNode.labels = t, t && (this.node.forcedSnapsToIntegralZoomLevels = !0, this.node.setZoomLevelAnimated(r.getIntegralZoom(this.node.zoomLevel))), this._previousNode.language = n.language, this._previousNode.configuration = n.types[this._map.mapType], this._previousNode.delegate = {
                  mapDidFinishRendering: function (t) {
                    this._map.previousMapDidFinishRendering(t)
                  }.bind(this)
                }, this._previousNode.setCameraBoundaryAnimated(null), this._previousNode.setCameraZoomRangeAnimated(null)
              } this._loadSpileIfNeeded((function (t) {
                t ? this.handleSpileLoad() : this.handleFallback(_.FETCH)
              }))
          } else this.handleFallback(_.WEBGL)
        },
        _enter_syrup_init: function () {
          if (!n.madabaDomains || !n.madabaDomains.length) return this._csrWarning(y), void this.handleFallback(_.CONFIG_MISSING);
          this._cachedSpileResult && !this.isSpileResultValid(this._cachedSpileResult) && this.invalidateSpileCache();
          var t = Spile.getRendererWithoutAnyWarranty();
          if (this._switchedToLoCSR = !this.knownGoodRendering || !this.manageableMap, n.forcedRenderingMode && (this._switchedToLoCSR = "HYBRID" === n.forcedRenderingMode), this.manageableMap || this.usingAdvancedAPIs || n.forcedRenderingMode) {
            var e = this.node;
            this._reConfigureMapNode(), e.init(n, t, Spile.Syrup.Camera, this._switchedToLoCSR, function (t) {
              t ? (this._csrWarning(v), this.handleFallback(_.INIT)) : (this._reConfigureMapNode(), e.needsDisplay = !0, this._map.didFinishMapNodeInitialization(e), this.handleSyrupComplete())
            }.bind(this))
          } else this.handleFallback(_.SUFFICIENT)
        },
        _csrWarning: function (t) {
          console.warn("[MapKit] CSR is unavailable:", t)
        },
        _enter_syrup_network_stalled: function () {
          this.node.updateNetworkConfiguration(n)
        },
        _enter_sg_ready: function () {
          this._removePreviousMapNode(), this.node.snapsToIntegralZoomLevels = !0, this.node.isRotationEnabled = !1, this._reConfigureMapNode(), this._map.mapNodeReady(!1)
        },
        _enter_syrup_ready: function () {
          !this.node.fullyRendered && this._previousNode && this._previousNode instanceof a && this._previousNode.configuration ? this._previousNode.configuration = n.types[this._map.mapType] : this._removePreviousMapNode(), this._reConfigureMapNode(), this.node.updateNetworkConfiguration(n), this.node.makePendingConfigurationUpdates(), this._map.mapNodeReady(!0)
        },
        _reConfigureMapNode: function () {
          this.node.language = n.language, this.node.configuration = n.types[this._map.mapType], this.node._impl.debug || (this.node._impl.debug = !!n.showsTileInfo), this._map.didReconfigureMapNode(this.node)
        },
        _enter_syrup_printing: function () {
          this.node.forceRerender(), this.node.needsDisplay = !0
        },
        _logFallback: function (t) {
          if (!o.doNotTrack()) {
            var e = "https://gsp10-ssl.ls.apple.com/hvr/mw/v1/spile";
            if (n.proxyPrefixes) e = n.proxyPrefixes[n.proxyPrefixes.length - 1] + e;
            var i = this._usingCSRAPI();
            new d(e, {
              getDataToSend: function (e) {
                e.setRequestHeader("Content-Type", "text/plain"), e.responseType = "text";
                var n = g.uaParserInfo.browserInfo,
                  o = g.uaParserInfo.deviceInfo;
                return JSON.stringify({
                  ssrFallback: {
                    reason: t,
                    usingCSRAPI: i,
                    devicePlatform: o.platform,
                    deviceOs: o.os,
                    browserName: n.name,
                    browserVersion: n.version
                  }
                })
              }
            }, {
              method: "POST",
              priority: u.Low,
              withCredentials: n.withCredentials
            }).schedule()
          }
        },
        _usingCSRAPI: function () {
          return !(this._map._showsCompass !== p.Visible && (this._map._showsCompass !== p.Adaptive || this._map._usingDefaultShowsCompassValue) && 0 === this._map.rotation && !this._map._annotationsController.containsMarkerAnnotation())
        },
        spileRun: function () {
          this.node && Spile && Spile.testRendering && Spile.testRendering(this.cacheSpileResult.bind(this))
        },
        cacheSpileResult: function (t) {
          if (this.node && t.status !== Spile.Status.MAYBE && t["gpu-identifier"]) {
            var e = k(t["gpu-identifier"].VERSION),
              i = t.status === Spile.Status.YES,
              n = S(w),
              s = n && M(n) || {};
            s[e] = {
              pass: i,
              version: Spile.version
            },
              function (t, e) {
                if (!o.supportsLocalStorage) return;
                try {
                  window.localStorage.setItem(t, e)
                } catch (t) {
                  return
                }
              }(w, JSON.stringify(s)), i || this.usingSSR || this.handleFallback(_.SPILE)
          }
        },
        isSpileResultValid: function (t) {
          if (Spile && Spile.version) return t.version === Spile.version
        },
        invalidateSpileCache: function () {
          ! function (t) {
            if (!o.supportsLocalStorage) return;
            try {
              window.localStorage.removeItem(t)
            } catch (t) {
              return
            }
          }(w)
        }
      }, t.exports = C
    },
    3188: (t, e, i) => {
      var n = i(9455),
        o = i(2114),
        s = i(2466),
        r = i(1636);

      function a(t, e) {
        r(this, a) && (Object.defineProperty(this, "_impl", {
          value: Object.create(n.prototype)
        }), n.call(this._impl, this, t, e))
      }
      a.MapTypes = n.MapTypes, a.ColorSchemes = n.ColorSchemes, a.Distances = n.Distances, a.prototype = o.inheritPrototype(s.EventTarget, a, {
        get padding() {
          return this._impl.padding
        },
        set padding(t) {
          this._impl.padding = t
        },
        get isScrollEnabled() {
          return this._impl.isScrollEnabled
        },
        set isScrollEnabled(t) {
          this._impl.isScrollEnabled = t
        },
        get isZoomEnabled() {
          return this._impl.isZoomEnabled
        },
        set isZoomEnabled(t) {
          this._impl.isZoomEnabled = t
        },
        get showsZoomControl() {
          return this._impl.showsZoomControl
        },
        set showsZoomControl(t) {
          this._impl.showsZoomControl = t
        },
        get showsScale() {
          return this._impl.showsScale
        },
        set showsScale(t) {
          this._impl.showsScale = t
        },
        get mapType() {
          return this._impl.getMapTypeWithEmphasis()
        },
        set mapType(t) {
          this._impl.setMapTypeWithEmphasis(t)
        },
        get colorScheme() {
          return this._impl.colorScheme
        },
        set colorScheme(t) {
          this._impl.colorScheme = t
        },
        get distances() {
          return this._impl.distances
        },
        set distances(t) {
          this._impl.distances = t
        },
        get _allowWheelToZoom() {
          return this._impl._allowWheelToZoom
        },
        set _allowWheelToZoom(t) {
          this._impl._allowWheelToZoom = t
        },
        get _showsTileInfo() {
          return this._impl._showsTileInfo
        },
        set _showsTileInfo(t) {
          this._impl._showsTileInfo = t
        },
        get _showsDefaultTiles() {
          return this._impl._showsDefaultTiles
        },
        set _showsDefaultTiles(t) {
          this._impl._showsDefaultTiles = t
        },
        get _landCoverStartUp() {
          return this._impl._landCoverStartUp
        },
        set _landCoverStartUp(t) {
          this._impl._landCoverStartUp = t
        },
        get _startUpMode() {
          return this._impl._startUpMode
        },
        set _startUpMode(t) {
          this._impl._startUpMode = t
        },
        get tileOverlays() {
          return this._impl.tileOverlays
        },
        set tileOverlays(t) {
          this._impl.tileOverlays = t
        },
        addTileOverlay: function (t) {
          return this._impl.addTileOverlay(t)
        },
        addTileOverlays: function (t) {
          return this._impl.addTileOverlays(t)
        },
        removeTileOverlay: function (t) {
          return this._impl.removeTileOverlay(t)
        },
        removeTileOverlays: function (t) {
          return this._impl.removeTileOverlays(t)
        },
        get showsMapTypeControl() {
          return this._impl.showsMapTypeControl
        },
        set showsMapTypeControl(t) {
          this._impl.showsMapTypeControl = t
        },
        get showsUserLocationControl() {
          return this._impl.showsUserLocationControl
        },
        set showsUserLocationControl(t) {
          this._impl.showsUserLocationControl = t
        },
        get showsPointsOfInterest() {
          return this._impl.showsPointsOfInterest
        },
        set showsPointsOfInterest(t) {
          this._impl.showsPointsOfInterest = t
        },
        get pointOfInterestFilter() {
          return this._impl.pointOfInterestFilter
        },
        set pointOfInterestFilter(t) {
          this._impl.pointOfInterestFilter = t
        },
        get element() {
          return this._impl.element
        },
        set element(t) {
          this._impl.element = t
        },
        get visibleMapRect() {
          return this._impl.visibleMapRect
        },
        set visibleMapRect(t) {
          this._impl.visibleMapRect = t
        },
        setVisibleMapRectAnimated: function (t, e) {
          return this._impl.setVisibleMapRectAnimated(t, e)
        },
        get region() {
          return this._impl.region
        },
        set region(t) {
          this._impl.region = t
        },
        setRegionAnimated: function (t, e) {
          return this._impl.setRegionAnimated(t, e)
        },
        get isRotationAvailable() {
          return this._impl.isRotationAvailable
        },
        set isRotationAvailable(t) {
          this._impl.isRotationAvailable = t
        },
        get isRotationEnabled() {
          return this._impl.isRotationEnabled
        },
        set isRotationEnabled(t) {
          this._impl.isRotationEnabled = t
        },
        get rotation() {
          return this._impl.rotation
        },
        set rotation(t) {
          this._impl.rotation = t
        },
        get showsCompass() {
          return this._impl.showsCompass
        },
        set showsCompass(t) {
          this._impl.showsCompass = t
        },
        setRotationAnimated: function (t, e) {
          return this._impl.setRotationAnimated(t, e)
        },
        get center() {
          return this._impl.center
        },
        set center(t) {
          this._impl.center = t
        },
        setCenterAnimated: function (t, e) {
          return this._impl.setCenterAnimated(t, e)
        },
        get cameraZoomRange() {
          return this._impl.cameraZoomRange
        },
        set cameraZoomRange(t) {
          this._impl.cameraZoomRange = t
        },
        setCameraZoomRangeAnimated: function (t, e) {
          return this._impl.setCameraZoomRangeAnimated(t, e)
        },
        get cameraDistance() {
          return this._impl.cameraDistance
        },
        set cameraDistance(t) {
          this._impl.cameraDistance = t
        },
        setCameraDistanceAnimated: function (t, e) {
          return this._impl.setCameraDistanceAnimated(t, e)
        },
        get cameraBoundary() {
          return this._impl.cameraBoundary
        },
        set cameraBoundary(t) {
          this._impl.cameraBoundary = t
        },
        setCameraBoundaryAnimated: function (t, e) {
          return this._impl.setCameraBoundaryAnimated(t, e)
        },
        get overlays() {
          return this._impl.overlays
        },
        set overlays(t) {
          this._impl.overlays = t
        },
        get selectedOverlay() {
          return this._impl.selectedOverlay
        },
        set selectedOverlay(t) {
          this._impl.selectedOverlay = t
        },
        addOverlay: function (t) {
          return this._impl.addOverlay(t)
        },
        addOverlays: function (t) {
          return this._impl.addOverlays(t)
        },
        removeOverlay: function (t) {
          return this._impl.removeOverlay(t)
        },
        removeOverlays: function (t) {
          return this._impl.removeOverlays(t)
        },
        topOverlayAtPoint: function (t) {
          return this._impl.topOverlayAtPoint(t)
        },
        overlaysAtPoint: function (t) {
          return this._impl.overlaysAtPoint(t)
        },
        get annotations() {
          return this._impl.annotations
        },
        set annotations(t) {
          this._impl.annotations = t
        },
        get selectedAnnotation() {
          return this._impl.selectedAnnotation
        },
        set selectedAnnotation(t) {
          this._impl.selectedAnnotation = t
        },
        addAnnotation: function (t) {
          return this._impl.addAnnotation(t)
        },
        addAnnotations: function (t) {
          return this._impl.addAnnotations(t)
        },
        removeAnnotation: function (t) {
          return this._impl.removeAnnotation(t)
        },
        removeAnnotations: function (t) {
          return this._impl.removeAnnotations(t)
        },
        showItems: function (t, e) {
          return this._impl.showItems(t, e)
        },
        addItems: function (t) {
          return this._impl.addItems(t)
        },
        removeItems: function (t) {
          return this._impl.removeItems(t)
        },
        annotationsInMapRect: function (t) {
          return this._impl.annotationsInMapRect(t)
        },
        updateSize: function (t) {
          return this._impl.updateSize(t)
        },
        convertCoordinateToPointOnPage: function (t) {
          return this._impl.convertCoordinateToPointOnPage(t)
        },
        convertPointOnPageToCoordinate: function (t) {
          return this._impl.convertPointOnPageToCoordinate(t)
        },
        get showsUserLocation() {
          return this._impl.showsUserLocation
        },
        set showsUserLocation(t) {
          this._impl.showsUserLocation = t
        },
        get userLocationAnnotation() {
          return this._impl.userLocationAnnotation
        },
        get tracksUserLocation() {
          return this._impl.tracksUserLocation
        },
        set tracksUserLocation(t) {
          this._impl.tracksUserLocation = t
        },
        get tintColor() {
          return this._impl.tintColor
        },
        set tintColor(t) {
          this._impl.tintColor = t
        },
        destroy: function () {
          this._impl.destroy()
        },
        get annotationForCluster() {
          return this._impl.annotationForCluster
        },
        set annotationForCluster(t) {
          this._impl.annotationForCluster = t
        }
      }), t.exports = a
    },
    7763: (t, e, i) => {
      var n = i(3462),
        o = i(584),
        s = i(2114),
        r = i(8006).Tints,
        a = i(3658),
        l = i(975),
        h = i(1692),
        c = i(5211),
        d = new o({
          lineWidth: 2,
          strokeColor: "white"
        }),
        u = function (t, e) {
          var i = c.location,
            n = void 0 === e ? 56 : e,
            o = (i && i.accuracy || 0) <= 3e4;
          return c.getMapRect().size.width * t >= n && o
        },
        p = a.lerp,
        m = function (t, e, i) {
          return s.clamp((t - e) / (i - e), 0, 1)
        },
        g = function () {
          var t = c.location,
            e = t && t.accuracy || 0;
          return e > 3e4 ? 0 : e
        };

      function _(t) {
        var e = t.coordinate,
          i = g();
        n.call(this, e, i, {
          style: d
        }), h.setIsAnimated(this, !0), this._isRingMode = !1, this._isShown = !1, this._fadeClock = 0
      }
      _.prototype = s.inheritPrototype(n, _, {
        updateIsShown: function (t, e, i) {
          var n = h.getClock(),
            o = u(e),
            s = o !== this._isRingMode ? n : this._fadeClock,
            r = n - s < 1e3,
            a = this._impl.shown && (o || r);
          a !== this._isShown && h.setIsAnimated(this, a), this._impl.shown = a, this._fadeClock = s, this._isRingMode = o, this._isShown = a, this._mapRegion = t, this._worldSize = e, this._colorScheme = i
        },
        performScheduledUpdate: function () {
          var t = h.getClock(),
            e = c.stale,
            i = this._mapRegion && this._mapRegion.toMapRect(),
            n = i ? i.size.width * this._worldSize : 0,
            o = c.getMapRect().size.width * this._worldSize,
            s = l.SystemColors[r.Light],
            d = l.SystemColors[r.Dark],
            u = "light" === this._colorScheme ? e ? s.gray : s.blue : e ? d.gray : d.blue;
          this.style.fillColor = "rgb(" + u.join(",") + ")", this.style.strokeColor = "dark" === this._colorScheme ? "rgba(" + s.gray3.join(",") + ", 0.5)" : "white";
          var g = m(o, 56, 940),
            _ = (e ? .2 : .14) * ("satellite" === this._colorScheme ? 2 : 1);
          this.style.fillOpacity = Math.pow(1 - g, 2) * _;
          var f = t - this._fadeClock,
            y = m(f, 0, 1e3),
            v = this._isRingMode ? y : 1 - y;
          this._impl.node.opacity = v;
          var w = m(o, 56, n),
            b = p(w, 2, 2.5),
            C = p(w, 4, 5),
            k = t % 2e3 / 2e3,
            S = a.easeInOut(1 - Math.abs(2 * k - 1));
          this.style.lineWidth = p(S, b, C)
        },
        updateForUserLocation: function (t) {
          this.coordinate = c.coordinate, this.radius = g()
        }
      }), Object.defineProperties(_, {
        getMode: {
          value: u
        }
      }), t.exports = _
    },
    1904: (t, e, i) => {
      var n = i(2071),
        o = i(1639),
        s = i(9601),
        r = s.Coordinate,
        a = s.MapRect,
        l = i(2114);

      function h(t, e, i, s) {
        n.call(this, new o(this), t, s), this.coordinate = e, this.radius = i
      }

      function c() {
        return [this._coordinate.toMapPoint()]
      }
      h.prototype = l.inheritPrototype(n, h, {
        get coordinate() {
          return this._coordinate
        },
        set coordinate(t) {
          l.checkInstance(t, r, "[MapKit] CircleOverlayInternal.coordinate expected a Coordinate value, but got `" + t + "` instead."), this._coordinate && this._coordinate.latitude === t.latitude && this._coordinate.longitude === t.longitude || (this._coordinate = t.copy(), this.updateGeometry())
        },
        get radius() {
          return this._radius
        },
        set radius(t) {
          var e = "[MapKit] CircleOverlayInternal.radius expected a non-negative number (radius in meters), but got `" + t + "` instead.";
          l.checkType(t, "number", e), t < 0 && console.warn(e);
          var i = Math.max(0, t);
          this._radius !== i && (this._radius = i, this.updateGeometry())
        },
        calculateBoundingRect: function () {
          if (!this._coordinate || isNaN(this._radius)) return null;
          var t = this._center = this._coordinate.toMapPoint(),
            e = this._mapRadius = this._radius * s.mapUnitsPerMeterAtLatitude(this._coordinate.latitude);
          return new a(t.x - e, t.y - e, 2 * e, 2 * e)
        },
        simplifyShapeAtLevel: c,
        clip: c
      }), t.exports = h
    },
    1639: (t, e, i) => {
      var n = i(1166),
        o = i(2043),
        s = i(2114);

      function r(t) {
        n.call(this, t, !0, new o(this))
      }
      r.prototype = s.inheritPrototype(n, r, {
        stringInfo: function () {
          var t = this.overlay;
          return "CircleOverlayNode<radius:" + t.radius + "," + t.coordinate.toString().toLowerCase() + ">" + (t.style.toString() ? "[" + t.style + "]" : "")
        }
      }), t.exports = r
    },
    2043: (t, e, i) => {
      var n = i(9601).MapPoint,
        o = i(210),
        s = i(7020),
        r = i(2114),
        a = 2 * Math.PI;

      function l(t) {
        s.call(this, t)
      }

      function h(t, e, i, n, s, r, l) {
        t.beginPath();
        var h = e.transformMapPoint(new o(i.x + n, i.y));
        r && (r += e.rotation), l && (l -= e.rotation), t.arc(h.x, h.y, s, r || 0, l || a, !0)
      }
      l.prototype = r.inheritPrototype(s, l, {
        drawShapes: function (t, e, i, n, o) {
          var s = this._node.overlay;
          this._node.shapes.forEach((function (r) {
            var a = r[0],
              l = s._mapRadius,
              c = l * o.worldSize;
            c < .5 || this.drawClipped(t, e, i, n, o, a, l, r.xOffset) || (h(t, o, a, r.xOffset, c), i && s.fillPath(t, e), n && s.strokePath(t, e, 1))
          }), this)
        },
        drawClipped: function (t, e, i, s, r, l, c, d) {
          var u = r.toRenderingMapRect();
          if (!s || c < u.size.width || c < u.size.height) return !1;
          var p = e._impl.halfStrokeWidthAtResolution() / r.worldSize,
            m = u.minX() - p - d,
            g = u.maxX() + p - d,
            _ = u.minY() - p,
            f = u.maxY() + p,
            y = l.x,
            v = l.y;

          function w(t, e) {
            var i = y - t,
              n = v - e;
            return i * i + n * n <= c * c
          }
          var b, C = [];
          w(g, f) && C.push(new n(g, f));
          var k = Math.acos((g - y) / c);
          if (!isNaN(k)) {
            var S = v + c * Math.sin(k);
            S >= _ && S <= f && ((b = new n(g, S)).angle = k, C.push(b)), (S = v - c * Math.sin(k)) >= _ && S <= f && ((b = new n(g, S)).angle = a - k, C.push(b))
          }
          w(g, _) && C.push(new n(g, _));
          var M = Math.asin((_ - v) / c);
          if (!isNaN(M)) {
            var E = y + c * Math.cos(M);
            E >= m && E <= g && ((b = new n(E, _)).angle = (M + a) % a, C.push(b)), (E = y - c * Math.cos(M)) >= m && E <= g && ((b = new n(E, _)).angle = Math.PI - M, C.push(b))
          }
          w(m, _) && C.push(new n(m, _));
          var L = Math.acos((m - y) / c);
          if (!isNaN(L)) {
            var T = v - c * Math.sin(L);
            T >= _ && T <= f && ((b = new n(m, T)).angle = a - L, C.push(b)), (T = v + c * Math.sin(L)) >= _ && T <= f && ((b = new n(m, T)).angle = L, C.push(b))
          }
          w(m, f) && C.push(new n(m, f));
          var x = Math.asin((f - v) / c);
          if (!isNaN(x)) {
            var A = y - c * Math.cos(x);
            A >= m && A <= g && ((b = new n(A, f)).angle = Math.PI - x, C.push(b)), (A = y + c * Math.cos(x)) >= m && A <= g && ((b = new n(A, f)).angle = (x + a) % a, C.push(b))
          }
          for (var I = C.length, R = 1; I > 2 && R < I && (!isNaN(C[R - 1].angle) || isNaN(C[R].angle) || isNaN(C[(R + 1) % I].angle));) R += 1;
          if (R < I) {
            for (var O = (R + 1) % I; I > 2 && !isNaN(C[O].angle) && !isNaN(C[(O + 1) % I].angle);) O = (O + 1) % I;
            var P = c * r.worldSize,
              D = Math.abs(C[R].angle - C[O].angle),
              z = P * D - 2 * P * Math.sin(D / 2) > .001,
              N = r.transformMapPoint(new o(C[R].x + d, C[R].y)),
              F = r.transformMapPoint(new o(C[O].x + d, C[O].y));
            if (i) {
              z ? h(t, r, l, d, P, C[R].angle, C[O].angle) : (t.beginPath(), t.moveTo(N.x, N.y), t.lineTo(F.x, F.y));
              for (var U = (O + 1) % I; isNaN(C[U].angle); U = (U + 1) % I) {
                var G = r.transformMapPoint(new o(C[U].x + d, C[U].y));
                t.lineTo(G.x, G.y)
              }
              this._node.overlay.fillPath(t, e)
            }
            s && (z ? h(t, r, l, d, P, C[R].angle, C[O].angle) : (t.beginPath(), t.moveTo(N.x, N.y), t.lineTo(F.x, F.y)), this._node.overlay.strokePath(t, e))
          } else I > 0 && i && (t.fillStyle = e.fillColor, t.globalAlpha = e.fillOpacity, t.fillRect(0, 0, u.size.width * r.worldSize, u.size.height * r.worldSize));
          return !0
        }
      }), t.exports = l
    },
    3462: (t, e, i) => {
      var n = i(8496),
        o = i(1904),
        s = i(2114),
        r = i(1636);

      function a(t, e, i) {
        r(this, a) && Object.defineProperty(this, "_impl", {
          value: new o(this, t, e, i)
        })
      }
      a.prototype = s.inheritPrototype(n, a, {
        get coordinate() {
          return this._impl.coordinate
        },
        set coordinate(t) {
          this._impl.coordinate = t
        },
        get radius() {
          return this._impl.radius
        },
        set radius(t) {
          this._impl.radius = t
        }
      }), t.exports = a
    },
    8479: (t, e, i) => {
      var n = i(2114),
        o = i(4937);

      function s() {
        this._overlays = []
      }
      s.prototype = {
        constructor: s,
        fadeOverlayTo: function (t, e) {
          Object.prototype.hasOwnProperty.call(t, "fadeInOutOpacity") ? t.fadeInOutOpacity.durationMs = 350 * Math.abs(t.fadeInOutOpacity.value - t.fadeInOutOpacity.end) : (t.fadeInOutOpacity = {
            durationMs: 350
          }, t.setFadeInOutOpacity(1 - e), this._overlays.push(t)), t.fadeInOutOpacity.start = t.fadeInOutOpacity.value, t.fadeInOutOpacity.end = e, t.fadeInOutOpacity.startTime = Date.now(), o.scheduleASAP(this)
        },
        performScheduledUpdate: function () {
          var t = Date.now();
          this._overlays = this._overlays.filter((function (e) {
            return e.setFadeInOutOpacity(n.clamp(e.fadeInOutOpacity.start + (e.fadeInOutOpacity.end - e.fadeInOutOpacity.start) * ((t - e.fadeInOutOpacity.startTime) / e.fadeInOutOpacity.durationMs), 0, 1)), e.fadeInOutOpacity.value !== e.fadeInOutOpacity.end || (delete e.fadeInOutOpacity, !1)
          })), this._overlays.length > 0 && o.scheduleOnNextFrame(this)
        }
      }, t.exports = s
    },
    4457: (t, e, i) => {
      var n = i(8961),
        o = i(2114),
        s = 0;

      function r(t) {
        if (this._offsets = [
          [0],
          [1]
        ], this._indices = [], this._lastUpdate = s++, "object" == typeof t)
          for (var e in t) this.addColorStop(parseFloat(e), t[e])
      }
      r.UPDATE_EVENT = "update-color-stop", r.prototype = o.inheritPrototype(n.EventTarget, r, {
        constructor: r,
        get offsets() {
          return this._offsets
        },
        get indices() {
          return this._indices
        },
        get lastUpdate() {
          return this._lastUpdate
        },
        addColorStop: function (t, e) {
          if ("number" != typeof t || !(t >= 0 && t <= 1)) throw new Error("[MapKit] Expected a number between 0 and 1 for offset of LineGradient.addColorStop, but got `" + t + "` instead.");
          o.checkType(e, "string", "[MapKit] Expected a string value for color in LineGradient.addColorStop, but got `" + e + "` instead."), this._addColorStop(this._offsets, t, e)
        },
        addColorStopAtIndex: function (t, e) {
          if ("number" != typeof t || t < 0 || t % 1 != 0) throw new Error("[MapKit] Expected a integer greater than or equal to 0 for index of LineGradient.addColorStopAtIndex, but got `" + t + "` instead.");
          o.checkType(e, "string", "[MapKit] Expected a string value for color in LineGradient.addColorStopAtIndex, but got `" + e + "` instead."), this._addColorStop(this._indices, t, e)
        },
        toString: function () {
          return "LineGradient"
        },
        _addColorStop: function (t, e, i) {
          for (var o = 0, a = t.length; o < a && t[o][0] < e;) ++o;
          o < a && t[o][0] === e ? t[o][1] = i : t.splice(o, 0, [e, i]), this._lastUpdate = s++, this.dispatchEvent(new n.Event(r.UPDATE_EVENT))
        }
      }), t.exports = r
    },
    7616: (t, e, i) => {
      var n = i(4457),
        o = i(1636);

      function s(t) {
        o(this, s) && Object.defineProperty(this, "_impl", {
          value: new n(t)
        })
      }
      s.prototype = {
        constructor: s,
        addColorStop: function (t, e) {
          this._impl.addColorStop(t, e)
        },
        addColorStopAtIndex: function (t, e) {
          this._impl.addColorStopAtIndex(t, e)
        },
        toString: function () {
          return this._impl.toString()
        }
      }, t.exports = s
    },
    6643: (t, e, i) => {
      var n = i(9601).MapRect,
        o = i(2114),
        s = ["visible", "enabled", "selected", "data"];

      function r(t, e, i) {
        this._node = t, this._public = e, i = o.checkOptions(i), s.forEach((function (t) {
          t in i && (this[t] = i[t])
        }), this), Object.keys(i).forEach((function (t) {
          s.indexOf(t) < 0 && console.warn("[MapKit] Unknown option: " + t + ". Use the data property to store custom data.")
        }))
      }
      r.prototype = {
        constructor: r,
        delegate: null,
        _map: null,
        _visible: !0,
        _enabled: !0,
        _selected: !1,
        get map() {
          return this._map
        },
        set map(t) {
          console.warn("[MapKit] The `map` property of an overlay is read-only. Use map.addOverlay() instead.")
        },
        get data() {
          return Object.prototype.hasOwnProperty.call(this, "_data") || (this._data = {}), this._data
        },
        set data(t) {
          this._data = t
        },
        get visible() {
          return this._visible
        },
        set visible(t) {
          var e = !!t;
          this._visible !== e && (this._visible = e, this.updatedProperty("visible"))
        },
        get enabled() {
          return this._enabled
        },
        set enabled(t) {
          this._enabled = !!t
        },
        get selected() {
          return this._selected
        },
        set selected(t) {
          var e = !!t;
          if (e !== this._selected) {
            if (this.delegate && !this.delegate.selectionMayChange) return void console.warn("[MapKit] Selection may not change in select/deselect event handler.");
            this._selected = e, this.updatedProperty("selected")
          }
        },
        get node() {
          return this._node
        },
        canBePicked: function () {
          return this.shown && this._visible
        },
        setMap: function (t) {
          t ? this._map = t : this._map && delete this._map
        },
        handleEvent: function () { },
        updatedProperty: function (t) {
          this.delegate && this.delegate.overlayPropertyDidChange(this._public, t)
        },
        visibleAfterClipping: function (t, e, i, o, s) {
          this._node.shapes = [];
          var r = this.visibilityToleranceAtScale(i),
            a = this._boundingRect || this.boundingRectAtScale(i);
          if (!this.visible || a.maxY() + r < t.minY() || a.minY() - r > t.maxY()) return !1;
          for (var l = a.minX() - r, h = a.maxX() + r, c = l < 0 ? 1 : 0, d = 1 + c, u = c - 1; u <= d; ++u) {
            var p = 0 === u ? t : new n(t.origin.x - u, t.origin.y, t.size.width, t.size.height);
            if (h >= p.minX() && l <= p.maxX()) {
              var m = this.clipOverlay(p, e, i, o, s);
              m.length > 0 && (m.xOffset = u, this._node.shapes.push(m))
            }
          }
          return this._node.shapes.length > 0
        },
        visibilityToleranceAtScale: function () {
          return 0
        }
      }, t.exports = r
    },
    2493: (t, e, i) => {
      var n = i(9328),
        o = i(2114);

      function s(t) {
        n.BaseNode.call(this), this.overlay = t
      }
      s.prototype = o.inheritPrototype(n.BaseNode, s, {}), t.exports = s
    },
    4662: (t, e, i) => {
      var n = i(2114),
        o = i(2466),
        s = i(6643);

      function r(t) {
        Object.defineProperty(this, "_impl", {
          value: new s(null, this, t)
        })
      }
      r.Events = {
        Select: "select",
        Deselect: "deselect"
      }, r.prototype = n.inheritPrototype(o.EventTarget, r, {
        get map() {
          return this._impl.map
        },
        set map(t) {
          this._impl.map = t
        },
        get data() {
          return this._impl.data
        },
        set data(t) {
          this._impl.data = t
        },
        get visible() {
          return this._impl.visible
        },
        set visible(t) {
          this._impl.visible = t
        },
        get enabled() {
          return this._impl.enabled
        },
        set enabled(t) {
          this._impl.enabled = t
        },
        get selected() {
          return this._impl.selected
        },
        set selected(t) {
          this._impl.selected = t
        }
      }), t.exports = r
    },
    9564: (t, e, i) => {
      var n = i(9328),
        o = i(2114);

      function s(t) {
        n.GroupNode.call(this), this._controller = t
      }
      s.prototype = o.inheritPrototype(n.GroupNode, s, {
        stringInfo: function () {
          return "OverlaysControllerNode"
        }
      }), t.exports = s
    },
    9059: (t, e, i) => {
      var n = i(8790),
        o = i(9564),
        s = i(4662),
        r = i(8479),
        a = i(7763),
        l = i(2114),
        h = i(3658),
        c = i(4937),
        d = i(975),
        u = i(8006).Tints;

      function p(t) {
        n.call(this, t), this._node = new o(this), this._fadeAnimationController = new r
      }
      p.prototype = l.inheritPrototype(n, p, {
        itemConstructor: s,
        itemName: "overlay",
        capitalizedItemName: "Overlay",
        get map() {
          return this._map
        },
        isItemExposed: function (t) {
          return t !== this._userLocationAccuracyRingOverlay
        },
        removeUserLocationAccuracyRingOverlay: function () {
          this._userLocationAccuracyRingOverlay && (this.removeAnyItem(this._userLocationAccuracyRingOverlay), delete this._userLocationAccuracyRingOverlay)
        },
        removedReferenceToMap: function () {
          this._items.forEach((function (t) {
            t._impl.setMap(null)
          }))
        },
        mapCameraDidChange: function () {
          0 !== this._items.length && (c.scheduleASAP(this), this._deletePreviousPointForPickingItem())
        },
        overlayPropertyDidChange: function (t, e) {
          switch (e) {
            case "selected":
              t.selected ? this.selectedItem = t : this.selectedItem = null, this._map.overlaySelectionDidChange(t), c.scheduleASAP(this);
              break;
            case "style":
            case "visible":
            case "geometry":
              c.scheduleASAP(this)
          }
        },
        fadeOverlayTo: function (t, e) {
          this._fadeAnimationController.fadeOverlayTo(t, e)
        },
        updateUserLocationAccuracyRingOverlay: function (t) {
          t.coordinate && (this._userLocationAccuracyRingOverlay ? this._userLocationAccuracyRingOverlay.updateForUserLocation(t) : this._userLocationAccuracyRingOverlay = this.addItem(new a(t)))
        },
        addedItem: function (t, e) {
          n.prototype.addedItem.call(this, t, e), t._impl.setMap(this._map.public), t.selected && (this.selectedItem = t), c.scheduleASAP(this)
        },
        removedItem: function (t) {
          t._impl.setMap(null), n.prototype.removedItem.call(this, t), c.scheduleASAP(this)
        },
        pickableItemsCloseToPoint: function (t, e, i) {
          var n = document.createElement("canvas"),
            o = n.getContext("2d"),
            s = n.width = n.height = 1,
            r = this._map.camera,
            a = s / 2,
            l = e.x - a,
            c = e.y - a;
          o.translate(-l, -c);
          var d = "number" == typeof i ? i : this._selectionDistance / h.devicePixelRatio,
            u = !1;
          return t.filter((function (t) {
            return !!t._impl.shown && (u && (o.clearRect(l, c, n.width, n.height), u = !1), t._impl.node._renderer.render(o, r, d), u = !0, !!o.getImageData(Math.floor(a), Math.floor(a), 1, 1).data[3])
          }), this).reverse()
        },
        performScheduledUpdate: function () {
          var t = this.map;
          if (t) {
            for (var e = t.camera.toRenderingMapRect(), i = t.worldSize, n = Math.ceil(l.log2(i)), o = [], s = this._items, r = 0, a = s.length; r < a; ++r) {
              var h = s[r];
              if (h._impl.shown = h._impl.visibleAfterClipping(e, true, i, n, !0), h === this._userLocationAccuracyRingOverlay) {
                var c = t.mapType,
                  p = c === d.MapTypes.Satellite || c === d.MapTypes.Hybrid ? "satellite" : t.colorScheme === u.Dark ? "dark" : "light";
                this._userLocationAccuracyRingOverlay.updateIsShown(t.region, t.worldSize, p)
              }
              h._impl.shown && !h.selected && (o.push(h._impl.node), h._impl.node.needsDisplay = !0)
            }
            var m = this.selectedItem;
            m && m._impl.shown && (o.push(m._impl.node), m._impl.node.needsDisplay = !0), this._node.children = o
          }
        }
      }), t.exports = p
    },
    4229: (t, e, i) => {
      var n = i(9601),
        o = n.Coordinate,
        s = n.MapRect,
        r = i(2071),
        a = i(9172),
        l = i(757),
        h = i(2114),
        c = i(9425);

      function d(t, e, i) {
        r.call(this, new a(this), t, i), this.points = e, this.updateGeometry()
      }
      d.prototype = h.inheritPrototype(r, d, {
        get points() {
          return this._points.map((function (t) {
            return t.slice()
          }))
        },
        set points(t) {
          h.checkArray(t, "[MapKit] PolygonOverlay.points expected an array of Coordinates."), Array.isArray(t[0]) || (t = [t]), this._points = t.map((function (t, e) {
            return h.checkArray(t, "[MapKit] PolygonOverlay.points expected an array at index: " + e), t.slice()
          })), this._polygons = this._points.map((function (t, e) {
            return t.map((function (t, i) {
              return h.checkInstance(t, o, "[MapKit] PolygonOverlay.points expected a Coordinate at index: " + e + ", " + i), t.toUnwrappedMapPoint()
            }))
          })), this.updateGeometry()
        },
        calculateBoundingRect: function () {
          var t, e, i = (t = this._polygons, e = t.filter((function (t) {
            return t.length > 2
          })).map((function (t) {
            var e = t.reduce((function (t, e) {
              return e.x < t.xMin && (t.xMin = e.x), e.x > t.xMax && (t.xMax = e.x), e.y < t.yMin && (t.yMin = e.y), e.y > t.yMax && (t.yMax = e.y), t
            }), {
              xMin: 1 / 0,
              xMax: -1 / 0,
              yMin: 1,
              yMax: 0
            });
            return new s(e.xMin, e.yMin, e.xMax - e.xMin, e.yMax - e.yMin)
          })).sort((function (t, e) {
            return t.minX() - e.minX()
          })), c.boundingRectForSortedRects(e));
          return delete this._simplifiedShapeLevel, i.size.width > 1 && console.warn("[MapKit] Polygon overlay spans over 360º in longitude and may not render correctly."), this._polygons.forEach((function (t) {
            0 !== t.length && (t.forEach((function (t) {
              var e = h.mod(t.x, 1);
              t.x = e + (e < i.minX() ? 1 : 0)
            })), l.preprocessPoints(t, !0))
          })), i
        },
        simplifyShapeAtLevel: function (t) {
          var e = this._simplifiedShapeLevel > t ? this._simplifiedShape : this._polygons,
            i = Math.pow(2, t);
          return e.reduce((function (t, e) {
            var n = l.filterPointsAtScale(e, i);
            return n.length > 0 && t.push(n), t
          }), [])
        },
        clip: function (t, e, i) {
          return !e || c.mapRectContains(e, this._boundingRect) ? t : function (t, e, i) {
            for (var n = e.minX() - i, o = e.minY() - i, s = e.maxX() + i, r = e.maxY() + i, a = [], l = 0, h = t.length; l < h; ++l) {
              for (var c = t[l], d = [], u = 0, p = c.length; u < p; ++u) {
                var m = c[u],
                  g = c[(u - 1 + p) % p];
                if (m.x >= n) {
                  if (g.x < n) {
                    var _ = (n - m.x) / (g.x - m.x);
                    d.push({
                      x: n,
                      y: (1 - _) * m.y + _ * g.y
                    })
                  }
                  d.push(m)
                } else g.x >= n && (_ = (n - m.x) / (g.x - m.x), d.push({
                  x: n,
                  y: (1 - _) * m.y + _ * g.y
                }))
              }
              var f = [];
              for (u = 0, p = d.length; u < p; ++u) m = d[u], g = d[(u - 1 + p) % p], m.y >= o ? (g.y < o && (_ = (o - m.y) / (g.y - m.y), f.push({
                x: (1 - _) * m.x + _ * g.x,
                y: o
              })), f.push(m)) : g.y >= o && (_ = (o - m.y) / (g.y - m.y), f.push({
                x: (1 - _) * m.x + _ * g.x,
                y: o
              }));
              var y = [];
              for (u = 0, p = f.length; u < p; ++u) m = f[u], g = f[(u - 1 + p) % p], m.x <= s ? (g.x > s && (_ = (s - m.x) / (g.x - m.x), y.push({
                x: s,
                y: (1 - _) * m.y + _ * g.y
              })), y.push(m)) : g.x <= s && (_ = (s - m.x) / (g.x - m.x), y.push({
                x: s,
                y: (1 - _) * m.y + _ * g.y
              }));
              var v = [];
              for (u = 0, p = y.length; u < p; ++u) m = y[u], g = y[(u - 1 + p) % p], m.y <= r ? (g.y > r && (_ = (r - m.y) / (g.y - m.y), v.push({
                x: (1 - _) * m.x + _ * g.x,
                y: r
              })), v.push(m)) : g.y <= r && (_ = (r - m.y) / (g.y - m.y), v.push({
                x: (1 - _) * m.x + _ * g.x,
                y: r
              }));
              v.length > 2 && a.push(v)
            }
            return a
          }(t, e, i)
        }
      }), t.exports = d
    },
    9172: (t, e, i) => {
      var n = i(1166),
        o = i(2114);

      function s(t) {
        n.call(this, t, !0)
      }
      s.prototype = o.inheritPrototype(n, s, {
        stringInfo: function () {
          var t = this.overlay;
          return "PolygonOverlayNode<points:" + (t.points.map((function (t) {
            return t.map((function (t) {
              return t.toString()
            })).join(",")
          })).join("|") + ">") + (t.style.toString() ? "[" + t.style + "]" : "")
        }
      }), t.exports = s
    },
    6459: (t, e, i) => {
      var n = i(8496),
        o = i(4229),
        s = i(1636),
        r = i(2114);

      function a(t, e) {
        s(this, a) && Object.defineProperty(this, "_impl", {
          value: new o(this, t, e)
        })
      }
      a.prototype = r.inheritPrototype(n, a, {
        get points() {
          return this._impl.points
        },
        set points(t) {
          this._impl.points = t
        }
      }), t.exports = a
    },
    6087: (t, e, i) => {
      var n = i(9601),
        o = n.Coordinate,
        s = n.MapRect,
        r = i(2071),
        a = i(694),
        l = i(757),
        h = i(9425),
        c = i(2114),
        d = 1e3;

      function u(t, e, i) {
        r.call(this, new a(this), t, i), this.points = e, this.updateGeometry()
      }

      function p(t, e, i) {
        for (var n = t[i], o = null, s = i - 1; !o; --s) void 0 !== t[s]._offset && (o = t[s]);
        var r = null;
        for (s = i + 1; !r; ++s) void 0 !== t[s]._offset && (r = t[s]);
        var a = Math.sqrt(Math.pow(o.x - n.x, 2) + Math.pow(o.y - n.y, 2));
        t[i]._offset = Math.min(o._offset + a / e, r._offset)
      }

      function m(t, e, i, n, o) {
        var s, r = o.minX() - o.size.width;
        if (t.x < r) return g(r, (1 - (s = (r - t.x) / i)) * t.y + s * e.y, t, e, i, n);
        if (r = o.maxX() + o.size.width, t.x > r) return g(r, (1 - (s = (r - t.x) / i)) * t.y + s * e.y, t, e, i, n);
        var a = o.minY() - o.size.height;
        return t.y < a ? g((1 - (s = (a - t.y) / n)) * t.x + s * e.x, a, t, e, i, n) : (a = o.maxY() + o.size.height, t.y > a ? g((1 - (s = (a - t.y) / n)) * t.x + s * e.x, a, t, e, i, n) : t)
      }

      function g(t, e, i, n, o, s) {
        var r = {
          x: t,
          y: e
        };
        if ("number" == typeof i._offset && "number" == typeof n._offset) {
          var a = Math.sqrt(o * o + s * s),
            l = Math.sqrt(Math.pow(t - i.x, 2) + Math.pow(e - i.y, 2));
          r._offset = i._offset + (n._offset - i._offset) * (l / a)
        }
        return r
      }
      u.prototype = c.inheritPrototype(r, u, {
        _fillable: !1,
        get points() {
          return this._points.slice()
        },
        set points(t) {
          c.checkInstance(t, Array, "[MapKit] PolylineOverlay.points expected an array of Coordinates."), this._points = t.slice(), this._mapPoints = this._points.map((function (t, e) {
            return c.checkInstance(t, o, "[MapKit] PolylineOverlay.points expected a Coordinate at index: " + e), t.toUnwrappedMapPoint()
          })), this._pointsNeedRemapping = !0, delete this._distances, delete this._colorStops, this.updateGeometry()
        },
        calculateBoundingRect: function () {
          if (0 === this._mapPoints.length) return new s(0, 0, 0, 0);
          var t = this._mapPoints.reduce((function (t, e) {
            return e.x < t.xMin && (t.xMin = e.x), e.x > t.xMax && (t.xMax = e.x), e.y < t.yMin && (t.yMin = e.y), e.y > t.yMax && (t.yMax = e.y), t
          }), {
            xMin: 1 / 0,
            xMax: -1 / 0,
            yMin: 1,
            yMax: 0
          }),
            e = t.xMax - t.xMin,
            i = c.mod(t.xMin, 1);
          if (this._pointsNeedRemapping) {
            delete this._pointsNeedRemapping, e > 1 && console.warn("[MapKit] Polyline overlay spans over 360º in longitude and may not render correctly.");
            var n = t.xMin - i;
            this._mapPoints.forEach((function (t) {
              t.x -= n
            })), l.preprocessPoints(this._mapPoints), delete this._simplifiedShapeLevel
          }
          return new s(i, t.yMin, e, t.yMax - t.yMin)
        },
        simplifyShapeAtLevel: function (t) {
          delete this._distances;
          var e = this._simplifiedShapeLevel > t ? this._simplifiedShape : this._mapPoints;
          return l.filterPointsAtScale(e, Math.pow(2, t))
        },
        clip: function (t, e, i) {
          return t.length > 0 && (t = this.clipShapeByStyleProperties(t)), !e || h.mapRectContains(e, this._boundingRect) ? 0 === t.length ? [] : [t] : function (t, e, i) {
            for (var n, o = e.minX() - i, s = e.minY() - i, r = e.maxX() + i, a = e.maxY() + i, l = d * e.size.width, h = d * e.size.height, c = [], u = 0, p = t.length; u < p - 1; ++u) {
              var g, _ = t[u],
                f = t[u + 1],
                y = f.x - _.x;
              if (0 !== y) {
                var v = (o - _.x) / y,
                  w = (r - _.x) / y;
                g = !(v < 0 && w < 0 || v > 1 && w > 1)
              } else g = _.x >= o && _.x <= r;
              if (g) {
                var b = f.y - _.y;
                if (0 !== b) {
                  var C = (s - _.y) / b,
                    k = (a - _.y) / b;
                  g = !(C < 0 && k < 0 || C > 1 && k > 1)
                } else g = _.y >= s && _.y <= a
              }
              var S = Math.abs(y) > l || Math.abs(b) > h;
              g ? (n || (n = []), S ? (n.push(m(_, f, y, b, e)), n.push(m(f, _, -y, -b, e)), c.push(n), n = null) : n.push(_)) : n && (S ? (n.push(m(_, f, y, b, e)), n.push(m(f, _, -y, -b, e))) : n.push(_), c.push(n), n = null)
            }
            n && (n.push(f), c.push(n));
            return c
          }(t, e, i)
        },
        clipShapeByStyleProperties: function (t) {
          var e = this.style.strokeStart,
            i = this.style.strokeEnd,
            n = this.style.lineGradient;
          if (0 !== e || 1 !== i || n) {
            if (!this._distances || n && !this._colorStops) {
              this._length = 0, this._distances = [];
              for (var o = 0, s = t.length; o < s - 1; ++o) {
                var r = t[o],
                  a = t[o + 1],
                  l = Math.sqrt(Math.pow(r.x - a.x, 2) + Math.pow(r.y - a.y, 2));
                this._length += l, this._distances.push(l)
              }
              if (n) {
                if (n._impl.indices.length > 0 && void 0 !== this._mapPoints[0]._offset)
                  for (var h = 0, c = this._mapPoints.length; h < c; ++h) delete this._mapPoints[h]._offset;
                for (var d = 0, u = 0; d < s - 1; ++d) t[d]._offset = u / this._length, u += this._distances[d];
                s > 0 && (t[s - 1]._offset = 1)
              }
            }
            0 === e && 1 === i || (t = function (t, e, i, n) {
              if (i >= n) return [];
              for (var o = 0, s = !1, r = [], a = 0, l = t.length; a < l - 1; ++a) {
                var h = t[a],
                  c = t[a + 1],
                  d = e[a];
                if (o += d, !s && o >= i) {
                  s = !0;
                  var u = (o - i) / d;
                  h = {
                    x: u * h.x + (1 - u) * c.x,
                    y: u * h.y + (1 - u) * c.y,
                    _offset: u * h._offset + (1 - u) * c._offset
                  }
                }
                if (s && (r.push(h), o >= n)) {
                  c = {
                    x: (u = (o - n) / d) * h.x + (1 - u) * c.x,
                    y: u * h.y + (1 - u) * c.y,
                    _offset: u * h._offset + (1 - u) * c._offset
                  };
                  break
                }
              }
              return r.push(c), r
            }(t, this._distances, e * this._length, i * this._length))
          }
          return t
        },
        getColorStops: function (t) {
          if (!this._colorStops || this._colorStops.lastUpdate !== t.lastUpdate) {
            var e = t.offsets,
              i = t.indices;
            this._colorStops = e.slice(), this._colorStops.lastUpdate = t.lastUpdate;
            for (var n = 0, o = this._mapPoints.length, s = 0, r = i.length; n < this._colorStops.length && s < r; ++n, ++s) {
              var a = i[s],
                l = a[0];
              if (!(l < o)) break;
              void 0 === this._mapPoints[l]._offset && p(this._mapPoints, this._length, l);
              for (var h = this._mapPoints[l]._offset, c = a[1]; this._colorStops[n][0] < h;) ++n;
              this._colorStops[n][0] === h ? this._colorStops[n][1] = c : this._colorStops.splice(n, 0, [h, c])
            }
          }
          return this._colorStops
        }
      }), t.exports = u
    },
    694: (t, e, i) => {
      var n = i(1166),
        o = i(2114);

      function s(t) {
        n.call(this, t, !1)
      }
      s.prototype = o.inheritPrototype(n, s, {
        supportsLineGradient: !0,
        stringInfo: function () {
          var t = this.overlay;
          return "PolylineOverlayNode<points:" + (t.points.map((function (t) {
            return t.toString()
          })).join(",") + ">") + (t.style.toString() ? "[" + t.style + "]" : "")
        }
      }), t.exports = s
    },
    9944: (t, e, i) => {
      var n = i(8496),
        o = i(6087),
        s = i(1636),
        r = i(2114);

      function a(t, e) {
        s(this, a) && Object.defineProperty(this, "_impl", {
          value: new o(this, t, e)
        })
      }
      a.prototype = r.inheritPrototype(n, a, {
        get points() {
          return this._impl.points
        },
        set points(t) {
          this._impl.points = t
        }
      }), t.exports = a
    },
    4003: (t, e, i) => {
      var n = i(8961),
        o = i(2114),
        s = i(3658),
        r = i(7616),
        a = i(4457),
        l = ["butt", "round", "square"],
        h = ["miter", "round", "bevel"],
        c = ["nonzero", "evenodd"];

      function d(t) {
        for (var e in o.checkOptions(t), t) {
          var i = Object.getOwnPropertyDescriptor(d.prototype, e);
          i && i.set ? this[e] = t[e] : console.warn("[MapKit] Style has no property named `" + e + "`, ignoring.")
        }
      }
      d.UPDATE_EVENT = "update-style";
      var u = "rgb(0, 122, 255)";
      d.prototype = o.inheritPrototype(n.EventTarget, d, {
        _strokeColor: u,
        _strokeOpacity: 1,
        _strokeStart: 0,
        _strokeEnd: 1,
        _lineWidth: 1,
        _lineCap: "round",
        _lineJoin: "round",
        _lineDash: [],
        _lineDashOffset: 0,
        _lineGradient: null,
        _fillColor: u,
        _fillOpacity: .1,
        _fillRule: "nonzero",
        get strokeColor() {
          return this._strokeColor
        },
        set strokeColor(t) {
          null != t && o.checkType(t, "string", "[MapKit] Expected a string value for Style.strokeColor, but got `" + t + "` instead."), this._strokeColor !== t && (this._strokeColor = t, this._updated())
        },
        get strokeOpacity() {
          return this._strokeOpacity
        },
        set strokeOpacity(t) {
          o.checkType(t, "number", "[MapKit] Expected a number value for Style.strokeOpacity, but got `" + t + "` instead.");
          var e = o.clamp(t, 0, 1);
          this._strokeOpacity !== e && (this._strokeOpacity = e, this._warnLineGradientComparability(), this._updated())
        },
        get strokeStart() {
          return this._strokeStart
        },
        set strokeStart(t) {
          if ("number" != typeof t || !(t >= 0 && t <= 1)) throw new Error("[MapKit] Expected a number between 0 and 1 for Style.strokeStart, but got `" + t + "` instead.");
          this._strokeStart !== t && (this._strokeStart = t, this._updated())
        },
        get strokeEnd() {
          return this._strokeEnd
        },
        set strokeEnd(t) {
          if ("number" != typeof t || !(t >= 0 && t <= 1)) throw new Error("[MapKit] Expected a number between 0 and 1 for Style.strokeEnd, but got `" + t + "` instead.");
          this._strokeEnd !== t && (this._strokeEnd = t, this._updated())
        },
        get lineWidth() {
          return this._lineWidth
        },
        set lineWidth(t) {
          o.checkType(t, "number", "[MapKit] Expected a number value for Style.lineWidth, but got `" + t + "` instead.");
          var e = Math.max(0, t);
          this._lineWidth !== e && (this._lineWidth = e, this._updated())
        },
        get lineCap() {
          return this._lineCap
        },
        set lineCap(t) {
          var e = l,
            i = "[MapKit] Expected one of " + e.map((function (t) {
              return "`" + t + "`"
            })).join(", ") + " for Style.lineCap, but got `" + t + "` instead.";
          if (o.checkType(t, "string", i), e.indexOf(t) < 0) throw new TypeError(i);
          this._lineCap !== t && (this._lineCap = t, this._warnLineGradientComparability(), this._updated())
        },
        get lineJoin() {
          return this._lineJoin
        },
        set lineJoin(t) {
          var e = h,
            i = "[MapKit] Expected one of " + e.map((function (t) {
              return "`" + t + "`"
            })).join(", ") + " for Style.lineJoin, but got `" + t + "` instead.";
          if (o.checkType(t, "string", i), e.indexOf(t) < 0) throw new TypeError(i);
          this._lineJoin !== t && (this._lineJoin = t, this._warnLineGradientComparability(), this._updated())
        },
        get lineDash() {
          return this._lineDash
        },
        set lineDash(t) {
          o.checkArray(t, "[MapKit] Expected an array of numbers for Style.lineDash, but got `" + t + "` instead."), t.forEach((function (t, e) {
            o.checkType(t, "number", "[MapKit] Expected an array of numbers for Style.lineDash, but got `" + t + "` at index " + e + " instead.")
          })), this._lineDash = t.slice(), this._warnLineGradientComparability(), this._updated()
        },
        get lineDashOffset() {
          return this._lineDashOffset
        },
        set lineDashOffset(t) {
          o.checkType(t, "number", "[MapKit] Expected a number value for Style.lineDashOffset, but got `" + t + "` instead."), this._lineDashOffset !== t && (this._lineDashOffset = t, this._updated())
        },
        get lineGradient() {
          return this._lineGradient
        },
        set lineGradient(t) {
          null !== t && o.checkInstance(t, r, "[MapKit] Expected a LineGradient object value (or null) for Style.lineGradient, but got `" + t + "` instead."), this._lineGradient !== t && (this._lineGradient && this._lineGradient._impl.removeEventListener(a.UPDATE_EVENT, this), this._lineGradient = t, this._lineGradient && this._lineGradient._impl.addEventListener(a.UPDATE_EVENT, this), this._warnLineGradientComparability(), this._updated())
        },
        colorStopsForOverlay: function (t) {
          if (!this._lineGradient) return null;
          var e = this._lineGradient;
          return 0 === e._impl.indices.length ? e._impl.offsets : t.getColorStops(e._impl)
        },
        get fillColor() {
          return this._fillColor
        },
        set fillColor(t) {
          null != t && o.checkType(t, "string", "[MapKit] Expected a string value for Style.fillColor, but got `" + t + "` instead."), this._fillColor !== t && (this._fillColor = t, this._updated())
        },
        get fillOpacity() {
          return this._fillOpacity
        },
        set fillOpacity(t) {
          o.checkType(t, "number", "[MapKit] Expected a number value for Style.fillOpacity, but got `" + t + "` instead.");
          var e = o.clamp(t, 0, 1);
          this._fillOpacity !== e && (this._fillOpacity = e, this._updated())
        },
        get fillRule() {
          return this._fillRule
        },
        set fillRule(t) {
          var e = c,
            i = "[MapKit] Expected one of " + e.map((function (t) {
              return "`" + t + "`"
            })).join(", ") + " for Style.fillRule, but got `" + t + "` instead.";
          if (o.checkType(t, "string", i), e.indexOf(t) < 0) throw new TypeError(i);
          this._fillRule !== t && (this._fillRule = t, this._updated())
        },
        shouldStroke: function () {
          return (this.strokeColor || this.lineGradient) && this.strokeOpacity > 0 && this.lineWidth > 0
        },
        shouldFill: function () {
          return this.fillColor && this.fillOpacity > 0
        },
        halfStrokeWidthAtResolution: function () {
          return this.strokeColor && this.strokeOpacity > 0 ? this.lineWidth / 2 * s.devicePixelRatio : 0
        },
        styleForHitTesting: function (t) {
          var e = Object.create(this);
          return null != this._fillColor && (e._fillColor = u, e._fillOpacity = 1), e._strokeColor = u, e._strokeOpacity = 1, e._lineWidth = this.lineWidth + t, e._impl = e, e
        },
        toString: function () {
          return ["strokeColor", "strokeOpacity", "strokeStart", "strokeEnd", "lineWidth", "lineCap", "lineJoin", "lineDash", "lineDashOffset", "lineGradient", "fillColor", "fillOpacity", "fillRule"].filter((function (t) {
            return Object.prototype.hasOwnProperty.call(this, "_" + t)
          }), this).map((function (t) {
            return t + ":" + (Array.isArray(this[t]) ? JSON.stringify(this[t]) : this.prop && this[t].toString ? this[t].toString() : this[t])
          }), this).join(",")
        },
        handleEvent: function (t) {
          t.type === a.UPDATE_EVENT && this._updated()
        },
        _warnLineGradientComparability: function () {
          if (this.lineGradient) {
            var t = [];
            1 !== this.strokeOpacity && t.push("strokeOpacity"), "round" !== this.lineCap && t.push("lineCap"), "round" !== this.lineJoin && t.push("lineJoin"), 0 !== this.lineDash.length && t.push("lineDash"), 0 !== t.length && (1 === t.length ? console.warn("[MapKit] lineGradient is incompatible with the following style property: " + t[0] + ".") : console.warn("[MapKit] lineGradient is incompatible with the following style properties: " + t.join(", ") + "."))
          }
        },
        _updated: function () {
          this.dispatchEvent(new n.Event(d.UPDATE_EVENT))
        }
      }), t.exports = d
    },
    584: (t, e, i) => {
      var n = i(4003),
        o = i(1636);

      function s(t) {
        o(this, s) && Object.defineProperty(this, "_impl", {
          value: new n(t)
        })
      }
      s.prototype = {
        constructor: s,
        get strokeColor() {
          return this._impl.strokeColor
        },
        set strokeColor(t) {
          this._impl.strokeColor = t
        },
        get strokeOpacity() {
          return this._impl.strokeOpacity
        },
        set strokeOpacity(t) {
          this._impl.strokeOpacity = t
        },
        get strokeStart() {
          return this._impl.strokeStart
        },
        set strokeStart(t) {
          this._impl.strokeStart = t
        },
        get strokeEnd() {
          return this._impl.strokeEnd
        },
        set strokeEnd(t) {
          this._impl.strokeEnd = t
        },
        get lineWidth() {
          return this._impl.lineWidth
        },
        set lineWidth(t) {
          this._impl.lineWidth = t
        },
        get lineCap() {
          return this._impl.lineCap
        },
        set lineCap(t) {
          this._impl.lineCap = t
        },
        get lineJoin() {
          return this._impl.lineJoin
        },
        set lineJoin(t) {
          this._impl.lineJoin = t
        },
        get lineDash() {
          return this._impl.lineDash
        },
        set lineDash(t) {
          this._impl.lineDash = t
        },
        get lineDashOffset() {
          return this._impl.lineDashOffset
        },
        set lineDashOffset(t) {
          this._impl.lineDashOffset = t
        },
        get lineGradient() {
          return this._impl.lineGradient
        },
        set lineGradient(t) {
          this._impl.lineGradient = t
        },
        get fillColor() {
          return this._impl.fillColor
        },
        set fillColor(t) {
          this._impl.fillColor = t
        },
        get fillOpacity() {
          return this._impl.fillOpacity
        },
        set fillOpacity(t) {
          this._impl.fillOpacity = t
        },
        get fillRule() {
          return this._impl.fillRule
        },
        set fillRule(t) {
          this._impl.fillRule = t
        },
        toString: function () {
          return this._impl.toString()
        }
      }, t.exports = s
    },
    2071: (t, e, i) => {
      var n = i(6643),
        o = i(584),
        s = i(4003),
        r = i(2114),
        a = i(3658);

      function l(t, e, i) {
        if (i && "object" == typeof i && "style" in i) {
          this.style = i.style;
          var o = {};
          Object.keys(i).forEach((function (t) {
            "style" !== t && (o[t] = i[t])
          })), i = o
        }
        n.call(this, t, e, i)
      }
      l.prototype = r.inheritPrototype(n, l, {
        constructor: l,
        _fillable: !0,
        fadeInOutOpacity: {
          value: 1
        },
        get style() {
          return this._style || (this._style = new o, this._style._impl.addEventListener(s.UPDATE_EVENT, this)), this._style
        },
        set style(t) {
          if (this._style) {
            if (this._style === t) return;
            this._style._impl.removeEventListener(s.UPDATE_EVENT, this)
          }
          r.checkInstance(t, o, "[MapKit] Expected a mapkit.Style value for Overlay.style, but got `" + t + "` instead."), this._style !== t && (this._style = t, this._style && this._style._impl.addEventListener(s.UPDATE_EVENT, this), this.updatedProperty("style"))
        },
        visibilityToleranceAtScale: function (t) {
          return this.style._impl.halfStrokeWidthAtResolution() / t
        },
        clipOverlay: function (t, e, i, n, o) {
          if (this._simplifiedShapeLevel !== n) {
            var s = Math.abs(this._simplifiedShapeLevel - n),
              r = !!this._hasPoints,
              a = this._simplifiedShape;
            this._simplifiedShape = this.simplifyShapeAtLevel(n), this._simplifiedShapeLevel = n, this._hasPoints = this._simplifiedShape.length > 0, 1 === s && r !== this._hasPoints && (this.delegate.fadeOverlayTo(this, r ? 0 : 1), r && (this.fadeInOutOpacity.previousShape = this.clip(a)))
          }
          var l = this.fadeInOutOpacity.previousShape || (e || !this.clippedShape ? this.clip(this._simplifiedShape, t, this.style._impl.halfStrokeWidthAtResolution() / i) : this.clippedShape);
          return o && (this.clippedShape = l), l
        },
        setFadeInOutOpacity: function (t) {
          this.fadeInOutOpacity.value = t, this.updatedProperty("style")
        },
        handleEvent: function (t) {
          t.type === s.UPDATE_EVENT && this.updatedProperty("style")
        },
        fillPath: function (t, e) {
          t.save(), t.fillStyle = e.fillColor, t.globalAlpha = e.fillOpacity * this.fadeInOutOpacity.value * this.node.opacity, t.fill(e.fillRule), t.restore()
        },
        strokePath: function (t, e, i, n) {
          t.save(), t.strokeStyle = n || e.strokeColor, t.globalAlpha = e.strokeOpacity * this.fadeInOutOpacity.value * this.node.opacity;
          var o = i || a.devicePixelRatio;
          t.lineWidth = e.lineWidth * o, e.lineDash.length > 0 && "function" == typeof t.setLineDash && (t.setLineDash(e.lineDash.map((function (t) {
            return t * o
          }))), t.lineDashOffset = e.lineDashOffset * o), t.lineJoin = e.lineJoin, t.lineCap = e.lineCap, t.stroke(), t.restore()
        },
        updateGeometry: function () {
          var t = this.calculateBoundingRect();
          t && (this._boundingRect = t, this.updatedProperty("geometry"))
        }
      }), t.exports = l
    },
    1166: (t, e, i) => {
      var n = i(2493),
        o = i(7020),
        s = i(2114);

      function r(t, e, i) {
        n.call(this, t), this._closed = !!e, this._renderer = i || new o(this)
      }
      r.prototype = s.inheritPrototype(n, r, {
        get closed() {
          return this._closed
        }
      }), t.exports = r
    },
    7020: (t, e, i) => {
      var n = i(9328),
        o = i(2114),
        s = i(210);

      function r(t) {
        n.RenderItem.call(this, t)
      }
      r.prototype = o.inheritPrototype(n.RenderItem, r, {
        draw: function (t) {
          if (this._node.overlay.map) {
            var e = this._node.overlay.map._impl.camera;
            this.render(t, e)
          }
        },
        render: function (t, e, i) {
          var n = this._node.overlay.style;
          "number" == typeof i && (n = n._impl.styleForHitTesting(i));
          var o = this._node.closed && n._impl.shouldFill(),
            s = n._impl.shouldStroke();
          (o || s) && this.drawShapes(t, n, o, s, e)
        },
        drawShapes: function (t, e, i, n, o) {

          e._impl.lineGradient && this._node.supportsLineGradient ? n && this.drawGradient(t, e, o) : (t.beginPath(), this._node.shapes.forEach((function (e) {
            e.forEach((function (i) {
              var n = o.transformMapPoint(new s(i[0].x + e.xOffset, i[0].y));
              t.moveTo(n.x, n.y);
              for (var r = 1, a = i.length; r < a; r++) n = o.transformMapPoint(new s(i[r].x + e.xOffset, i[r].y)), t.lineTo(n.x, n.y);
              this._node.closed && t.closePath()
            }), this)
          }), this), i && this._node.overlay.fillPath(t, e), n && this._node.overlay.strokePath(t, e, 1))
        },
        drawGradient: function (t, e, i) {
          var n = e._impl.colorStopsForOverlay(this._node.overlay),
            o = 0;
          this._node.shapes.forEach((function (r) {
            r.forEach((function (h) {
              for (var c, d, u, p, m = []; h[0]._offset > n[o][0];) ++o, v = n[o][0];
              for (var g = 0, _ = h.length; g < _;) {
                var f = h[g]._offset,
                  y = i.transformMapPoint(new s(h[g].x + r.xOffset, h[g].y)),
                  v = n[o][0],
                  w = a.normalize(n[o][1] || e.strokeColor);
                if (f === v) m.push([f, y, w]), ++g, ++o;
                else if (f < v) {
                  var b = n[o - 1],
                    C = b[0],
                    k = b[1] || e.strokeColor,
                    S = l((c = a.stringToRGBA(k), d = a.stringToRGBA(w), p = void 0, p = 1 - (u = (f - C) / (v - C)), [Math.round(c[0] * p + d[0] * u), Math.round(c[1] * p + d[1] * u), Math.round(c[2] * p + d[2] * u), Math.round(c[3] * p + d[3] * u)]));
                  m.push([f, y, S]), ++g
                } else {
                  m[m.length - 1].push([v, w]), ++o
                }
              }
              this.strokePathForLineEvents(t, m, e)
            }), this)
          }), this)
        },
        strokePathForLineEvents: function (t, e, i) {
          for (var n = 0, s = e.length - 1; n < s; ++n) {
            t.beginPath();
            var r = e[n],
              a = r[1],
              l = e[n + 1][1];
            t.moveTo(a.x, a.y), t.lineTo(l.x, l.y);
            var h = t.createLinearGradient(a.x, a.y, l.x, l.y);
            if (h.addColorStop(0, r[2]), r.length > 2)
              for (var c = r[0], d = e[n + 1][0] - c, u = 3; u < r.length; ++u) h.addColorStop(o.clamp((r[u][0] - c) / d, 0, 1), r[u][1] || i.strokeColor);
            h.addColorStop(1, e[n + 1][2]), this._node.overlay.strokePath(t, i, 1, h)
          }
        }
      });
      var a = {
        colorMap: {},
        normalize: function (t) {
          return l(this.stringToRGBA(t))
        },
        stringToRGBA: function (t) {
          if (t in this.colorMap) return this.colorMap[t];
          if (!this.context) {
            var e = document.createElement("canvas");
            this.context = e.getContext("2d")
          }
          this.context.canvas.width = 1, this.context.fillStyle = t, this.context.fillRect(0, 0, 1, 1);
          var i = this.context.getImageData(0, 0, 1, 1).data,
            n = [i[0], i[1], i[2], i[3]];
          return this.colorMap[t] = n, n
        }
      };

      function l(t) {
        return "rgba(" + t[0] + "," + t[1] + "," + t[2] + "," + t[3] + ")"
      }
      t.exports = r
    },
    8496: (t, e, i) => {
      var n = i(4662),
        o = i(2071),
        s = i(2114);

      function r(t) {
        Object.defineProperty(this, "_impl", {
          value: new o(this, t)
        })
      }
      r.prototype = s.inheritPrototype(n, r, {
        constructor: r,
        get style() {
          return this._impl.style
        },
        set style(t) {
          this._impl.style = t
        }
      }), t.exports = r
    },
    7094: (t, e, i) => {
      var n = i(2114),
        o = i(1636);

      function s() {
        if (o(this, s)) {
          var t = arguments.length;
          if (1 === t && "object" == typeof arguments[0]) {
            this.top = 0, this.right = 0, this.bottom = 0, this.left = 0;
            var e = arguments[0];
            Object.keys(e).forEach((function (t) {
              "top" === t || "right" === t || "bottom" === t || "left" === t ? this[t] = e[t] : console.warn("[MapKit] Unknown property `" + t + "` for Padding constructor.")
            }), this)
          } else this.top = t > 0 ? arguments[0] : 0, this.right = t > 1 ? arguments[1] : 0, this.bottom = t > 2 ? arguments[2] : 0, this.left = t > 3 ? arguments[3] : 0;
          n.checkType(this.top, "number", "[MapKit] Expected a number for `top` in Padding constructor but got `" + this.top + "` instead."), n.checkType(this.left, "number", "[MapKit] Expected a number for `left` in Padding constructor but got `" + this.left + "` instead."), n.checkType(this.bottom, "number", "[MapKit] Expected a number for `bottom` in Padding constructor but got `" + this.bottom + "` instead."), n.checkType(this.right, "number", "[MapKit] Expected a number for `right` in Padding constructor but got `" + this.right + "` instead.")
        }
      }
      s.Zero = new s, s.prototype = {
        constructor: s,
        toString: function () {
          return "Padding(" + [this.top, this.right, this.bottom, this.left].join(", ") + ")"
        },
        copy: function () {
          return new s(this.top, this.right, this.bottom, this.left)
        },
        equals: function (t) {
          return this.top === t.top && this.right === t.right && this.bottom === t.bottom && this.left === t.left
        }
      }, t.exports = s
    },
    5161: t => {
      t.exports = {
        Airport: "Airport",
        AmusementPark: "AmusementPark",
        Aquarium: "Aquarium",
        ATM: "ATM",
        Bakery: "Bakery",
        Bank: "Bank",
        Beach: "Beach",
        Brewery: "Brewery",
        Cafe: "Cafe",
        Campground: "Campground",
        CarRental: "CarRental",
        EVCharger: "EVCharger",
        FireStation: "FireStation",
        FitnessCenter: "FitnessCenter",
        FoodMarket: "FoodMarket",
        GasStation: "GasStation",
        Hospital: "Hospital",
        Hotel: "Hotel",
        Laundry: "Laundry",
        Library: "Library",
        Marina: "Marina",
        MovieTheater: "MovieTheater",
        Museum: "Museum",
        NationalPark: "NationalPark",
        Nightlife: "Nightlife",
        Park: "Park",
        Parking: "Parking",
        Pharmacy: "Pharmacy",
        Police: "Police",
        PostOffice: "PostOffice",
        PublicTransport: "PublicTransport",
        Restaurant: "Restaurant",
        Restroom: "Restroom",
        School: "School",
        Stadium: "Stadium",
        Store: "Store",
        Theater: "Theater",
        University: "University",
        Winery: "Winery",
        Zoo: "Zoo"
      }
    },
    6572: (t, e, i) => {
      var n = i(2114),
        o = i(5161);

      function s(t) {
        return t.map((function (t) {
          if (!n.checkValueIsInEnum(t, o)) throw new Error("[MapKit] Unknown category `" + t + "`. Choose from mapkit.PointOfInterestCategory.");
          return t
        }))
      }

      function r(t) {
        if ("includes" in (t = n.checkOptions(t)) && "excludes" in t) throw new Error("[MapKit] `includes` and `excludes` may not be specified at the same time.");
        if (!("includes" in t) && !("excludes" in t)) throw new Error("[MapKit] Either `includes` or `excludes` should be specified.");
        "includes" in t && (this._includes = s(t.includes)), "excludes" in t && (this._excludes = s(t.excludes))
      }
      var a = function () {
        throw new Error("[MapKit] `PointOfInterestFilter` may not be constructed directly. Use the mapkit.PointOfInterestFilter.including or the mapkit.PointOfInterestFilter.excluding methods.")
      };
      r.prototype = a.prototype = {
        constructor: a,
        _includes: null,
        _excludes: null,
        includesCategory: function (t) {
          if (!n.checkValueIsInEnum(t, o)) throw new Error("[MapKit] Unknown category `" + t + "`. Choose from mapkit.PointOfInterestCategory.");
          return this._includes ? -1 !== this._includes.indexOf(t) : this._excludes ? -1 === this._excludes.indexOf(t) : void 0
        },
        excludesCategory: function (t) {
          if (!n.checkValueIsInEnum(t, o)) throw new Error("[MapKit] Unknown category `" + t + "`. Choose from mapkit.PointOfInterestCategory.");
          return this._includes ? -1 === this._includes.indexOf(t) : this._excludes ? -1 !== this._excludes.indexOf(t) : void 0
        }
      }, Object.defineProperties(a, {
        including: {
          get: function () {
            return r.including
          }
        },
        excluding: {
          get: function () {
            return r.excluding
          }
        }
      }), Object.defineProperties(r, {
        exposedConstructor: {
          value: a
        },
        including: {
          value: function (t) {
            return n.checkArray(t, "[MapKit] mapkit.pointOfInterestFilterIncludingCategories expected an array of categories."), new r({
              includes: t
            })
          }
        },
        excluding: {
          value: function (t) {
            return n.checkArray(t, "[MapKit] mapkit.pointOfInterestFilterExcludingCategories expected an array of categories."), new r({
              excludes: t
            })
          }
        },
        filterIncludingAllCategories: {
          get: function () {
            var t = this.excluding([]);
            return Object.defineProperty(this, "filterIncludingAllCategories", {
              value: t
            }), t
          },
          configurable: !0
        },
        filterExcludingAllCategories: {
          get: function () {
            var t = this.including([]);
            return Object.defineProperty(this, "filterExcludingAllCategories", {
              value: t
            }), t
          },
          configurable: !0
        }
      }), t.exports = r
    },
    2466: (t, e, i) => {
      var n = i(7640),
        o = i(6246);

      function s() { }
      s.prototype = Object.create(n.EventTarget.prototype), s.prototype.dispatchEvent = function (t) {
        return o(n.EventTarget.prototype.dispatchEvent, this, [t], !0)
      };
      var r = {
        EventTarget: s,
        Event: n.Event
      };
      t.exports = r
    },
    3437: (t, e, i) => {
      var n = i(3032),
        o = i(9601).Coordinate,
        s = i(2114),
        r = i(5900),
        a = i(4730),
        l = i(6246),
        h = i(6783),
        c = ["language"],
        d = ["origin", "destination", "transportType", "requestsAlternateRoutes", "arrivalDate", "departureDate", "avoidTolls"],
        u = ["origin", "destinations", "transportType", "departureDate"],
        p = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);

      function m(t) {
        t = s.checkOptions(t), this._checkOptions(t, c), r.call(this, "Directions", t)
      }

      function g(t, e) {
        if (!(t instanceof Date) || isNaN(t.getTime())) throw new TypeError("[MapKit] Expected a `Date` object for `" + e + "`, but got `" + t + "` instead.")
      }

      function _(t) {
        if ("string" == typeof t) return {
          q: t
        };
        if ("object" == typeof t && t.muid) return {
          muid: t.muid
        };
        var e = t.coordinate || t;
        if (e instanceof o) return {
          loc: {
            lat: e.latitude,
            lng: e.longitude
          }
        };
        throw new Error("[MapKit] Location must be an address (string), Coordinate object or Place object.")
      }

      function f(t, e) {
        return e ? new a(e) : t instanceof a ? t : t instanceof o ? t.copy() : void 0
      }

      function y(t, e, i) {
        this.name = t.name, this.distance = t.distanceMeters, this.expectedTravelTime = t.durationSeconds, this.transportType = t.transportType;
        var n = t.avoidTolls;
        this.hasTolls = "boolean" == typeof n ? !n : void 0, this._path = t.stepIndexes.map((function (t) {
          return i[t]
        })), this.steps = t.stepIndexes.map((function (t) {
          return e[t]
        }))
      }
      m.Transport = {
        Automobile: "AUTOMOBILE",
        Walking: "WALKING"
      }, m.prototype = s.inheritPrototype(r, m, {
        constructor: m,
        eta: function (t, e) {
          if (s.required(t, "[MapKit] Missing `request` in call to `Directions.eta()`.").checkOptions(t, "[MapKit] `request` is not a valid object."), s.required(e, "[MapKit] Missing `callback` in call to `Directions.eta()`.").checkType(e, "function", "[MapKit] `callback` passed to `Directions.eta()` is not a function."), this._checkOptions(t, u), s.required(t.origin, "[MapKit] Missing required property `origin` in `request` object."), s.required(t.destinations, "[MapKit] Missing required property `destinations` in `request` object."), !Array.isArray(t.destinations)) throw new Error("[MapKit] Required property `destinations` in `request` object must be an array.");
          if (t.destinations.length > 10) throw new Error("[MapKit] `destinations` array must be less than 10 destinations.");
          if (s.checkInstance(t.origin, o, "[MapKit] `origin` property in `request` is not a Coordinate."), t.destinations.forEach((function (t) {
            s.checkInstance(t, o, "[MapKit] One of the values in `destinations` property in `request` is not a Coordinate.")
          })), "CN" !== n.countryCode) {
            var i = this._handleEtaResponse.bind(this, t),
              r = {
                origin: t.origin.latitude + "," + t.origin.longitude,
                destinations: t.destinations.map((function (t) {
                  return t.latitude + "," + t.longitude
                })).join("|")
              },
              a = t.transportType;
            if (a) {
              for (var h in m.Transport) a === m.Transport[h] && (r.transportType = m.Transport[h]);
              if (!r.transportType) throw new TypeError("[MapKit] transportType must be a value of `Directions.Transport`.")
            }
            var c = t.departureDate;
            c && (g(c, "departureDate"), r.departureDate = c.toISOString());
            var d = this.language || n.language;
            return d && (r.lang = d), this._send("etas", r, e, i, "etas")
          }
          setTimeout((function () {
            var t = new Error("[MapKit] ETA Requests are not supported in China yet.");
            l(e, null, [t])
          }))
        },
        route: function (t, e) {
          s.required(t, "[MapKit] Missing `request` in call to `Directions.route()`.").checkOptions(t, "[MapKit] `request` is not a valid object."), s.required(e, "[MapKit] Missing `callback` in call to `Directions.route()`.").checkType(e, "function", "[MapKit] `callback` passed to `Directions.route()` is not a function."), this._checkOptions(t, d);
          var i = this._handleResponse.bind(this, t),
            o = {},
            r = t.origin,
            a = t.destination,
            l = t.transportType,
            h = t.arrivalDate,
            c = t.departureDate,
            u = t.avoidTolls,
            f = l === m.Transport.Automobile,
            y = l === m.Transport.Walking;
          if (s.required(r, "[MapKit] Missing required property `origin` in `request` object."), s.required(a, "[MapKit] Missing required property `destination` in `request` object."), o.wps = JSON.stringify([_(r), _(a)]), l) {
            if (!f && !y) throw new TypeError("[MapKit] transportType must be either Directions.Transport.Automobile or Directions.Transport.Walking.");
            o.transport = l
          }
          h && c ? console.warn("[MapKit] `Directions.route()` should not be sent an `arrivalDate` and `departureDate` in the same request. These parameters have been dropped from the request.") : "CN" === n.countryCode && (h || c) ? console.warn("[MapKit] `arrivalDate` and `departureDate` are not supported in China yet. These parameters have been dropped from the request.") : h ? (g(h, "arrivalDate"), o.arrivalDate = h.toISOString()) : c && (g(c, "departureDate"), o.departureDate = c.toISOString()), p(t, "requestsAlternateRoutes") ? o.n = t.requestsAlternateRoutes ? "3" : "1" : o.n = "1";
          var v = this.language || n.language;
          return v && (o.lang = v), u && y ? console.warn("[MapKit] When `transportType` is `Directions.Transport.Walking`, the `avoidTolls` parameter has no effect. The `avoidTolls` parameter has been dropped from the request.") : u && "CN" === n.countryCode ? console.warn("[MapKit] `avoidTolls` is not supported in China yet. This parameter has been dropped from the request.") : u && (o.avoid = "tolls"), this._send("directions", o, e, i, "directions")
        },
        _handleEtaResponse: function (t, e, i) {
          return {
            request: e,
            origin: t.origin.copy(),
            etas: i.etas.map((function (e, i) {
              return {
                destination: t.destinations[i] ? t.destinations[i].copy() : void 0,
                transportType: e.transportType,
                distance: e.distanceMeters,
                expectedTravelTime: e.expectedTravelTimeSeconds,
                staticTravelTime: e.staticTravelTimeSeconds
              }
            }))
          }
        },
        _handleResponse: function (t, e, i) {
          var n = i.stepPaths.map((function (t) {
            return t.map((function (t) {
              return new o(t.lat, t.lng)
            }))
          })),
            s = i.steps.map((function (t) {
              return new C(t, n, i.shieldDomains)
            })),
            r = i.routes.map((function (t) {
              return new y(t, s, n)
            }));
          return {
            request: e,
            origin: f(t.origin, i.origin),
            destination: f(t.destination, i.destination),
            routes: r
          }
        }
      });
      var v = function () {
        throw new TypeError("[MapKit] Route may not be constructed.")
      };

      function w(t) {
        delete y.prototype.polyline, Object.defineProperty(y.prototype, "polyline", {
          enumerable: !0,
          get: function () {
            return this._polyline || (this._polyline = new t(this._path.reduce((function (t, e) {
              return t.concat(e)
            }), []))), this._polyline
          }
        })
      }
      v.prototype = y.prototype = {
        constructor: v,
        get path() {
          return console.warn("[MapKit] The `Route.path` property is deprecated and will be removed in a future release."), this._path
        },
        get polyline() {
          throw new Error("[MapKit] Route.polyline is not available until the required library is loaded.")
        }
      }, h.jsModules.mapkit.PolylineOverlay ? w(h.jsModules.mapkit.PolylineOverlay) : h.addEventListener("load", (function t(e) {
        e.jsModules.mapkit.PolylineOverlay && (h.removeEventListener("load", t), w(h.jsModules.mapkit.PolylineOverlay))
      })), m.Route = y;
      var b = ["ON_RAMP", "OFF_RAMP", "HIGHWAY_OFF_RAMP_LEFT", "HIGHWAY_OFF_RAMP_RIGHT", "CHANGE_HIGHWAY", "CHANGE_HIGHWAY_LEFT", "CHANGE_HIGHWAY_RIGHT"];

      function C(t, e, i) {
        if (this.instructions = t.instructions, this.pathIndex = t.stepPathIndex, this.distance = t.distanceMeters, this.transportType = t.transportType, this.path = e[t.stepPathIndex], i && i.length && t.maneuver) {
          var n, o, s = i[t.stepPathIndex % i.length],
            r = t.maneuver;
          if (r.names && r.names.length) {
            var a = r.names.filter((function (t) {
              return t.type && t.shieldUrl
            }));
            a.length && (n = "//" + s + a[0].shieldUrl)
          }
          r.arrowUrl && (o = "//" + s + r.arrowUrl);
          var l = n && -1 !== b.indexOf(r.type);
          this._imageUrl = l ? n : o
        }
      }
      var k = function () {
        throw new TypeError("[MapKit] Step may not be constructed.")
      };
      k.prototype = C.prototype = {
        constructor: k
      }, t.exports = m
    },
    4802: (t, e, i) => {
      var n = i(2114),
        o = i(3591),
        s = i(3437),
        r = i(1636);

      function a(t) {
        r(this, a) && Object.defineProperty(this, "_impl", {
          value: new s(t)
        })
      }
      a.Transport = s.Transport, a.prototype = n.inheritPrototype(o, a, {
        constructor: a,
        eta: function (t, e) {
          return this._impl.eta(t, e)
        },
        route: function (t, e) {
          return this._impl.route(t, e)
        }
      }), t.exports = a
    },
    7443: (t, e, i) => {
      "use strict";
      var n = i(3032),
        o = i(2114),
        s = i(9601),
        r = i(5900),
        a = i(4730),
        l = s.Coordinate,
        h = ["language", "getsUserLocation"],
        c = ["language", "region", "coordinate", "limitToCountries"],
        d = ["language"];

      function u(t) {
        t = o.checkOptions(t), this._checkOptions(t, h), r.call(this, "Geocoder", t)
      }
      u.prototype = o.inheritPrototype(r, u, {
        constructor: u,
        lookup: function (t, e, i) {
          var s = {};
          i = o.checkOptions(i), this._checkOptions(i, c), o.required(t, "[MapKit] Missing `address` in call to `Geocoder.lookup()`.").checkType(t, "string", "[MapKit] `address` passed to `Geocoder.lookup()` is not a string."), o.required(e, "[MapKit] Missing `callback` in call to `Geocoder.lookup()`.").checkType(e, "function", "[MapKit] `callback` passed to `Geocoder.lookup()` is not a function."), s.q = t;
          var r = i.region,
            a = i.coordinate,
            l = i.limitToCountries,
            h = this.language || n.language;
          if (r) {
            var d = r.toBoundingRegion();
            s.searchRegion = [d.northLatitude, d.eastLongitude, d.southLatitude, d.westLongitude].join(",")
          } else a && (s.searchLocation = [a.latitude, a.longitude].join(","));
          return i.language && (h = this._bestLanguage(i.language)), h && (s.lang = h), l && (o.checkType(l, "string", "[MapKit] `limitToCountries` is not a string."), s.limitToCountries = l), this._sendImmediatelyOrWithUserLocation("geocode", s, e, this._transform, "geocode")
        },
        reverseLookup: function (t, e, i) {
          var s = {},
            r = this.language || n.language;
          return i = o.checkOptions(i), this._checkOptions(i, d), o.required(t, "[MapKit] Missing `coordinate` in call to `Geocoder.reverseLookup()`.").checkInstance(t, l, "[MapKit] `coordinate` passed to `Geocoder.reverseLookup()` is not a Coordinate."), o.required(e, "[MapKit] Missing `callback` in call to `Geocoder.reverseLookup()`.").checkType(e, "function", "[MapKit] `callback` passed to `Geocoder.reverseLookup()` is not a function."), s.loc = t.latitude + "," + t.longitude, i.language && (r = this._bestLanguage(i.language)), r && (s.lang = r), this._send("reverseGeocode", s, e, this._transform, "reverseGeocode")
        },
        _transform: function (t, e) {
          var i = {
            status: e.status,
            results: []
          };
          return e.results && (i.results = e.results.map((function (t) {
            return new a(t)
          }))), i
        }
      }), t.exports = u
    },
    6701: (t, e, i) => {
      var n = i(2114),
        o = i(3591),
        s = i(7443),
        r = i(1636);

      function a(t) {
        r(this, a) && Object.defineProperty(this, "_impl", {
          value: new s(t)
        })
      }
      a.prototype = n.inheritPrototype(o, a, {
        constructor: a,
        lookup: function (t, e, i) {
          return this._impl.lookup(t, e, i)
        },
        reverseLookup: function (t, e, i) {
          return this._impl.reverseLookup(t, e, i)
        }
      }), t.exports = a
    },
    3745: (t, e, i) => {
      var n = i(3032),
        o = i(2114),
        s = i(5900),
        r = i(4730),
        a = i(6246);

      function l() {
        s.call(this, "MapFeatureAnnotation", {})
      }
      l.prototype = o.inheritPrototype(s, l, {
        fetch: function (t, e) {
          if ("CN" !== n.countryCode) {
            var i = {
              mapsId: JSON.stringify({
                muid: t
              })
            };
            return this._send("placedata", i, e, (function (t, e) {
              if (e && e.result) return new r(e.result)
            }), "placedata")
          }
          setTimeout((function () {
            var t = new Error("[MapKit] MapFeatureAnnotation.fetch() is not supported in China yet.");
            a(e, null, [t])
          }))
        }
      }), t.exports = l
    },
    1487: (t, e, i) => {
      var n = i(3032),
        o = i(2114),
        s = i(9601),
        r = i(5900),
        a = i(6572),
        l = i(4730),
        h = s.CoordinateRegion,
        c = s.Coordinate,
        d = i(6246),
        u = ["language", "getsUserLocation", "center", "radius", "region", "pointOfInterestFilter"];

      function p(t) {
        t = o.checkOptions(t), this._checkOptions(t, u), r.call(this, "PointsOfInterestsSearch", t), this.center = t.center, this.radius = t.radius, this.region = t.region, "pointOfInterestFilter" in t && (this.pointOfInterestFilter = t.pointOfInterestFilter)
      }
      p.prototype = o.inheritPrototype(r, p, {
        constructor: p,
        _center: null,
        _radius: null,
        _region: null,
        _pointOfInterestFilter: null,
        get center() {
          return this._center
        },
        set center(t) {
          null != t && (o.checkInstance(t, c, "[MapKit] PointsOfInterestSearch.center expected a Coordinate value."), t = t.copy()), this._center = t || null
        },
        get radius() {
          return this._radius
        },
        set radius(t) {
          null != t && o.checkType(t, "number", "[MapKit] PointsOfInterestSearch.radius expected a number value."), this._radius = t || null
        },
        get region() {
          return this._region
        },
        set region(t) {
          null != t && (o.checkInstance(t, h, "[MapKit] PointsOfInterestSearch.region expected a CoordinateRegion value."), t = t.copy()), this._region = t || null
        },
        get getsUserLocation() {
          return !1
        },
        set getsUserLocation(t) {
          throw new TypeError("[MapKit] getsUserLocation on PointsOfInterestSearch has not effect.")
        },
        get pointOfInterestFilter() {
          return this._pointOfInterestFilter
        },
        set pointOfInterestFilter(t) {
          t && o.checkInstance(t, a, "[MapKit] Unknown value for `pointOfInterestFilter`. It must be an instance of mapkit.PointOfInterestFilter."), this._pointOfInterestFilter = t || null
        },
        search: function (t, e) {
          if (e = o.checkOptions(e), this._checkOptions(e, u), "object" == typeof t) {
            var i = t;
            t = function (t, e) {
              var n = i.searchDidError,
                o = i.searchDidComplete;
              t ? "function" == typeof n && n.call(i, t) : "function" == typeof o && o.call(i, e)
            }
          }
          if ("CN" !== n.countryCode) {
            var s = {};
            e.pointOfInterestFilter && o.checkInstance(e.pointOfInterestFilter, a, "[MapKit] Unknown value for `pointOfInterestFilter`. It must be an instance of mapkit.PointOfInterestFilter."), o.required(t, "[MapKit] Missing `callback` in call to `search`.").checkType(t, "function", "[MapKit] `callback` passed to `search` is not a function.");
            var r = e.center || this.center,
              l = e.radius || this.radius,
              p = e.region || this.region;
            if ((r || l) && p) setTimeout((function () {
              var e = new Error("[MapKit] Setting both `center`/`radius` and region are not allowed. Expects either a circular region defined by `center`/`radius` or a rectangular region defined by `region`.");
              d(t, null, [e])
            }));
            else {
              if (r || l || p) {
                if (r || l) o.checkInstance(r, c, "[MapKit] `center` should be a Coordinate when specify a circular search region."), s.center = [r.latitude, r.longitude].join(","), l && (s.radius = l.toString(10));
                else if (p) {
                  o.checkInstance(p, h, "[MapKit] `region` should be a CoordinateRegion when specify a rectangular search region.");
                  var m = p.toBoundingRegion();
                  s.mapRegion = [m.northLatitude, m.eastLongitude, m.southLatitude, m.westLongitude].join(",")
                } else 0;
                if ("getsUserLocation" in e) throw Error("[MapKit] getsUserLocation on PointsOfInterestSearch has not effect.");
                var g = this.language || n.language;
                e.language && (g = this._bestLanguage(e.language)), g && (s.lang = g);
                var _ = e.pointOfInterestFilter || this.pointOfInterestFilter;
                if (_) {
                  if (_._includes) {
                    if (0 === _._includes.length) return void setTimeout(function () {
                      d(t, null, [null, this._nearbyPoiTransform(void 0, {})])
                    }.bind(this));
                    s.includePoiCategories = _._includes.join(",")
                  }
                  _._excludes && (s.excludePoiCategories = _._excludes.join(","))
                }
                return this._send("nearbyPoi", s, t, this._nearbyPoiTransform, "nearbyPoi")
              }
              setTimeout((function () {
                var e = new Error("[MapKit] No search region specified. Expects either a circular region defined by `center`/`radius` or a rectangular region defined by `region`.");
                d(t, null, [e])
              }))
            }
          } else setTimeout((function () {
            var e = new Error("[MapKit] PointsOfInterestSearch is not supported in China yet.");
            d(t, null, [e])
          }))
        },
        _checkOptions: function (t, e) {
          if (("center" in t || "radius" in t) && "region" in t) throw new Error("[MapKit] Setting both `center`/`radius` and region are not allowed. Expects either a circular region defined by `center`/`radius` or a rectangular region defined by `region`.");
          return r.prototype._checkOptions.call(this, t, e)
        },
        _nearbyPoiTransform: function (t, e) {
          var i = {
            places: []
          };
          return e.results && (i.places = e.results.map((function (t) {
            return new l(t)
          }))), i
        }
      }), t.exports = p
    },
    2333: (t, e, i) => {
      var n = i(2114),
        o = i(3591),
        s = i(1487),
        r = i(1636);

      function a(t) {
        r(this, a) && Object.defineProperty(this, "_impl", {
          value: new s(t)
        })
      }
      a.prototype = n.inheritPrototype(o, a, {
        constructor: a,
        get center() {
          return this._impl.center
        },
        set center(t) {
          this._impl.center = t
        },
        get radius() {
          return this._impl.radius
        },
        set radius(t) {
          this._impl.radius = t
        },
        get region() {
          return this._impl.region
        },
        set region(t) {
          this._impl.region = t
        },
        get pointOfInterestFilter() {
          return this._impl.pointOfInterestFilter
        },
        set pointOfInterestFilter(t) {
          this._impl.pointOfInterestFilter = t
        },
        search: function (t, e) {
          return this._impl.search(t, e)
        }
      }), Object.defineProperty(a, "MaxRadius", {
        enumerable: !0,
        value: 2e3
      }), t.exports = a
    },
    4065: t => {
      function e() {
        this._requests = {}, this._types = {}, this._counter = 1
      }
      e.prototype = {
        constructor: e,
        add: function (t, e) {
          var i = this._counter;
          return this._counter += 1, this._requests[i] = t, this._types[i] = e, i
        },
        get: function (t) {
          return this._requests[t]
        },
        typeForId: function (t) {
          return this._types[t]
        },
        idsByType: function (t) {
          return Object.keys(this._requests).filter((function (e) {
            return this._types[e] === t
          }), this).map((function (t) {
            return parseInt(t)
          }))
        },
        remove: function (t) {
          return !!this.get(t) && (delete this._requests[t], delete this._types[t], !0)
        }
      }, t.exports = e
    },
    1578: (t, e, i) => {
      var n = i(9601).Coordinate;

      function o(t) {
        this.displayLines = t.displayLines, t.location && (this.coordinate = new n(t.location.lat, t.location.lng)), this._completionUrl = t.completionUrl, t.attribution && (this._providerId = t.attribution.vendorId, this._providerItemId = t.attribution.externalItemId), this.name = t.name, this.telephone = t.telephone, this.urls = t.urls || [], this.country = t.country, this.administrativeArea = t.administrativeArea, this.administrativeAreaCode = t.administrativeAreaCode, this.locality = t.locality, this.postCode = t.postCode, this.subLocality = t.subLocality, this.thoroughfare = t.thoroughfare, this.subThoroughfare = t.subThoroughfare, this.fullThoroughfare = t.fullThoroughfare, this.areasOfInterest = t.areasOfInterest, this.dependentLocalities = t.dependentLocalities, this.timezone = t.timezone, this.timezoneSecondsFromGmt = t.timezoneSecondsFromGmt
      }
      var s = function () {
        throw new TypeError("[MapKit] SearchAutocompleteResult may not be constructed.")
      };
      o.prototype = s.prototype = {
        constructor: s
      }, t.exports = o
    },
    8497: (t, e, i) => {
      var n = i(3032),
        o = i(2114),
        s = i(9601),
        r = i(5900),
        a = i(6572),
        l = i(4730),
        h = i(1578),
        c = s.BoundingRegion,
        d = s.CoordinateRegion,
        u = s.Coordinate,
        p = ["language", "getsUserLocation", "coordinate", "region", "includeAddresses", "includePointsOfInterest", "includeQueries", "pointOfInterestFilter", "limitToCountries"],
        m = ["language", "region", "coordinate", "includeAddresses", "includePointsOfInterest", "pointOfInterestFilter", "limitToCountries"],
        g = m.concat(["includeQueries"]);

      function _(t) {
        t = o.checkOptions(t), this._checkOptions(t, p), r.call(this, "Search", t), this.coordinate = t.coordinate, this.region = t.region, "includeAddresses" in t && (this.includeAddresses = t.includeAddresses), "includePointsOfInterest" in t && (this.includePointsOfInterest = t.includePointsOfInterest), "includeQueries" in t && (this.includeQueries = t.includeQueries), "pointOfInterestFilter" in t && (this.pointOfInterestFilter = t.pointOfInterestFilter), "limitToCountries" in t && (this.limitToCountries = t.limitToCountries)
      }
      _.prototype = o.inheritPrototype(r, _, {
        constructor: _,
        _coordinate: null,
        _region: null,
        _includeAddresses: !0,
        _includePointsOfInterest: !0,
        _includeQueries: !0,
        _pointOfInterestFilter: null,
        _limitToCountries: null,
        get coordinate() {
          return this._coordinate
        },
        set coordinate(t) {
          null != t && (o.checkInstance(t, u, "[MapKit] Search.coordinate expected a Coordinate value."), t = t.copy()), this._coordinate = t || null
        },
        get region() {
          return this._region
        },
        set region(t) {
          null != t && (o.checkInstance(t, d, "[MapKit] Search.region expected a CoordinateRegion value."), t = t.copy()), this._region = t || null
        },
        get includeAddresses() {
          return this._includeAddresses
        },
        set includeAddresses(t) {
          this._includeAddresses = !!t
        },
        get includePointsOfInterest() {
          return this._includePointsOfInterest
        },
        set includePointsOfInterest(t) {
          this._includePointsOfInterest = !!t
        },
        get includeQueries() {
          return this._includeQueries
        },
        set includeQueries(t) {
          this._includeQueries = !!t
        },
        get pointOfInterestFilter() {
          return this._pointOfInterestFilter
        },
        set pointOfInterestFilter(t) {
          t && o.checkInstance(t, a, "[MapKit] Unknown value for `pointOfInterestFilter`. It must be an instance of mapkit.PointOfInterestFilter."), this._pointOfInterestFilter = t || null
        },
        get limitToCountries() {
          return this._limitToCountries
        },
        set limitToCountries(t) {
          t && o.checkType(t, "string", "[MapKit] `limitToCountries` is not a string."), this._limitToCountries = t || null
        },
        search: function (t, e, i) {
          return i = o.checkOptions(i), this._checkOptions(i, m), this._request("search", "search", this._searchTransform, t, e, i)
        },
        autocomplete: function (t, e, i) {
          i = o.checkOptions(i), this._checkOptions(i, g), this._request("autocomplete", "searchAutocomplete", this._autocompleteTransform, t, e, i)
        },
        _request: function (t, e, i, s, r, l) {
          if ("object" == typeof r) {
            var c = r;
            r = function (e, i) {
              var n = "search" === t ? c.searchDidError : c.autocompleteDidError,
                o = "search" === t ? c.searchDidComplete : c.autocompleteDidComplete;
              e ? "function" == typeof n && n.call(c, e) : "function" == typeof o && o.call(c, i)
            }
          }
          var d = {},
            u = "Search." + t + "()";
          if (o.required(s, "[MapKit] Missing `query` in call to `" + u + "`."), o.required(r, "[MapKit] Missing `callback` in call to `" + u + "`.").checkType(r, "function", "[MapKit] `callback` passed to `" + u + "` is not a function."), s instanceof h) e = s._completionUrl;
          else {
            if ("string" != typeof s) throw new TypeError("[MapKit] `query` passed to `" + u + "` is neither a string nor SearchAutocompleteResult.");
            d.q = s
          }
          var p = l.region || this.region,
            m = l.coordinate || this.coordinate,
            g = this.language || n.language;
          if (p) {
            var _ = p.toBoundingRegion();
            d.searchRegion = [_.northLatitude, _.eastLongitude, _.southLatitude, _.westLongitude].join(",")
          } else m && (d.searchLocation = [m.latitude, m.longitude].join(","));
          l.language && (g = this._bestLanguage(l.language)), g && (d.lang = g), l.pointOfInterestFilter && o.checkInstance(l.pointOfInterestFilter, a, "[MapKit] Unknown value for `pointOfInterestFilter`. It must be an instance of mapkit.PointOfInterestFilter."), l.limitToCountries && o.checkType(l.limitToCountries, "string", "[MapKit] `limitToCountries` is not a string."), (l.limitToCountries || this.limitToCountries) && (d.limitToCountries = l.limitToCountries || this.limitToCountries);
          var f = l.pointOfInterestFilter || this.pointOfInterestFilter,
            y = !0;
          f && (l.includePointsOfInterest || this.includePointsOfInterest || console.warn("[MapKit] `includePointsOfInterest` is false but `pointOfInterestFilter` is set."), f._includes && (0 === f._includes.length ? y = !1 : d.includePoiCategories = f._includes.join(",")), f._excludes && (d.excludePoiCategories = f._excludes.join(",")));
          var v = [];
          if ("includeAddresses" in l ? l.includeAddresses && v.push("address") : this.includeAddresses && v.push("address"), f ? y && v.push("poi") : "includePointsOfInterest" in l ? l.includePointsOfInterest && v.push("poi") : this.includePointsOfInterest && v.push("poi"), "searchAutocomplete" === e && ("includeQueries" in l ? l.includeQueries && v.push("query") : this.includeQueries && v.push("query")), 0 === v.length) throw new Error("[MapKit] At least one of the types needs to be included in the search/autocomplete request.");
          return d.resultTypeFilter = v.join(","), this._sendImmediatelyOrWithUserLocation(e, d, r, i, t)
        },
        _searchTransform: function (t, e) {
          var i = {
            places: []
          };
          if (t.q && (i.query = t.q), e.displayMapRegion) {
            0;
            var n = new c(e.displayMapRegion.northLat, e.displayMapRegion.eastLng, e.displayMapRegion.southLat, e.displayMapRegion.westLng);
            i.boundingRegion = n.toCoordinateRegion()
          }
          return e.results && (i.places = e.results.map((function (t) {
            return new l(t)
          }))), i
        },
        _autocompleteTransform: function (t, e) {
          var i = {
            query: t.q,
            results: []
          };
          return e.results && (i.results = e.results.map((function (t) {
            return new h(t)
          }))), i
        }
      }), t.exports = _
    },
    4730: (t, e, i) => {
      var n = i(9601),
        o = n.BoundingRegion,
        s = n.Coordinate,
        r = i(5161);

      function a(t) {
        var e, i;
        t.muid && (this.muid = t.muid), t.placecardUrl && (this._wpURL = t.placecardUrl), t.style && t.style.attributes && (this._styleAttributes = t.style.attributes.map((function (t) {
          return t.key + ":" + t.value
        })).join(","), t.poiCategory && -1 !== Object.keys(r).indexOf(t.poiCategory) && (this.pointOfInterestCategory = r[t.poiCategory])), t.name && (this.name = t.name), t.attribution && (this._providerId = t.attribution.vendorId, this._providerItemId = t.attribution.externalItemId), t.displayMapRegion && (e = t.displayMapRegion, i = new o(e.northLat, e.eastLng, e.southLat, e.westLng), this.region = i.toCoordinateRegion(), this.coordinate = this.region.center), t.formattedAddressLines && (this.formattedAddress = t.formattedAddressLines.join(", ")), t.center && (this.coordinate = new s(t.center.lat, t.center.lng)), t.countryCode && (this.countryCode = t.countryCode), this.telephone = t.telephone, this.urls = t.urls || [], this.country = t.country, this.administrativeArea = t.administrativeArea, this.administrativeAreaCode = t.administrativeAreaCode, this.locality = t.locality, this.postCode = t.postCode, this.subLocality = t.subLocality, this.thoroughfare = t.thoroughfare, this.subThoroughfare = t.subThoroughfare, this.fullThoroughfare = t.fullThoroughfare, this.areasOfInterest = t.areasOfInterest, this.dependentLocalities = t.dependentLocalities, this.timezone = t.timezone, this.timezoneSecondsFromGmt = t.timezoneSecondsFromGmt
      }
      var l = function () {
        throw new TypeError("[MapKit] Place may not be constructed.")
      };
      a.prototype = l.prototype = {
        constructor: l
      }, t.exports = a
    },
    955: (t, e, i) => {
      var n = i(2114),
        o = i(3591),
        s = i(8497),
        r = i(1636);

      function a(t) {
        r(this, a) && Object.defineProperty(this, "_impl", {
          value: new s(t)
        })
      }
      a.prototype = n.inheritPrototype(o, a, {
        constructor: a,
        get coordinate() {
          return this._impl.coordinate
        },
        set coordinate(t) {
          this._impl.coordinate = t
        },
        get region() {
          return this._impl.region
        },
        set region(t) {
          this._impl.region = t
        },
        get includeAddresses() {
          return this._impl.includeAddresses
        },
        set includeAddresses(t) {
          this._impl.includeAddresses = t
        },
        get includePointsOfInterest() {
          return this._impl.includePointsOfInterest
        },
        set includePointsOfInterest(t) {
          this._impl.includePointsOfInterest = t
        },
        get includeQueries() {
          return this._impl.includeQueries
        },
        set includeQueries(t) {
          this._impl.includeQueries = t
        },
        get pointOfInterestFilter() {
          return this._impl.pointOfInterestFilter
        },
        set pointOfInterestFilter(t) {
          this._impl.pointOfInterestFilter = t
        },
        get limitToCountries() {
          return this._impl.limitToCountries
        },
        set limitToCountries(t) {
          this._impl.limitToCountries = t
        },
        search: function (t, e, i) {
          return this._impl.search(t, e, i)
        },
        autocomplete: function (t, e, i) {
          return this._impl.autocomplete(t, e, i)
        }
      }), t.exports = a
    },
    5900: (t, e, i) => {
      var n = i(3032),
        o = i(9401),
        s = i(2114),
        r = i(5211),
        a = i(9601).Coordinate,
        l = i(4065),
        h = i(8877).XHRLoader,
        c = i(4891),
        d = i(1435),
        u = i(6246),
        p = {
          enableHighAccuracy: !1,
          timeout: 8e3,
          maximumAge: 9e5
        };

      function m(t, e) {
        this._name = t, this._requestMap = new l, n.state === n.States.ERROR && (this._configFailed = !0), this.language = e.language, "getsUserLocation" in e && (this.getsUserLocation = !!e.getsUserLocation)
      }
      m.prototype = {
        constructor: m,
        _getsUserLocation: !1,
        get getsUserLocation() {
          return this._getsUserLocation
        },
        set getsUserLocation(t) {
          this._getsUserLocation = !!t
        },
        get language() {
          return this._language
        },
        set language(t) {
          this._language = null == t ? null : this._bestLanguage(t)
        },
        cancel: function (t) {
          s.required(t, "[MapKit] Missing `id` in call to `" + this._name + ".cancel()`.").checkType(t, "number", "[MapKit] `id` passed to `" + this._name + ".cancel()` is not a number.");
          var e = this._requestMap.typeForId(t);
          if (e) switch (e) {
            case "query":
            case "geo":
              return this._requestMap.remove(t);
            case "xhr":
              var i = this._requestMap.get(t);
              if (i) return i.unschedule(), this._requestMap.remove(t);
              break;
            default:
              throw new Error("Unknown type: " + e)
          }
          return !1
        },
        handleEvent: function (t) {
          switch (t.type) {
            case n.Events.Error:
              this._configFailed = !0;
            case n.Events.Changed:
              this._requestMap.idsByType("query").forEach((function (t) {
                var e = this._requestMap.get(t);
                this._send(e.path, e.parameters, e.callback, e.transform, e.name), this._requestMap.remove(t)
              }), this)
          }
          0 === this._requestMap.idsByType("query").length && this._stopWatchingConfiguration()
        },
        _watchingConfiguration: !1,
        _watchConfiguration: function () {
          this._watchingConfiguration || (this._watchingConfiguration = !0, n.addEventListener(n.Events.Changed, this), n.addEventListener(n.Events.Error, this))
        },
        _stopWatchingConfiguration: function () {
          this._watchingConfiguration && (this._watchingConfiguration = !1, n.removeEventListener(n.Events.Changed, this), n.removeEventListener(n.Events.Error, this))
        },
        _logNetworkEvent: function (t, e) {
          var i;
          switch (t) {
            case "search":
              i = d.Events.Search;
              break;
            case "autocomplete":
              i = d.Events.SearchAC;
              break;
            case "geocode":
              i = d.Events.ForwardGeocoder;
              break;
            case "reverseGeocode":
              i = d.Events.ReverseGeocoder;
              break;
            case "directions":
              i = d.Events.Directions;
              break;
            case "nearbyPoi":
              i = d.Events.PointsOfInterestSearch;
              break;
            default:
              return
          }
          d.log(i, e)
        },
        _send: function (t, e, i, o, r) {
          var a, l = this._requestMap;
          if (!n.apiBaseUrl || n.state === n.States.PENDING) return this._configFailed ? (setTimeout((function () {
            u(i, null, [new Error("MapKit failed to initialize.")])
          })), 0) : (console.warn("[MapKit] The configuration has not been initialized, or it is loading. The request has been queued."), this._watchConfiguration(), l.add({
            path: t,
            parameters: e,
            callback: i,
            transform: o,
            name: r
          }, "query"));
          a = 0 === t.search(/\/v?[0-9]+\//) ? n.apiBaseUrl.replace(/\/v?[0-9]+\//, "") + t : n.apiBaseUrl + t, (e = e || {}).mkjsVersion = c.version;
          var d = s.toQueryString(e);
          "" !== d && (a += (s.parseURL(t).search ? "&" : "?") + d);
          var p = this,
            m = new h(a, {
              loaderDidSucceed: function (t, n) {
                var s;
                if (p._logNetworkEvent(r, {
                  responseCode: n.status
                }), l.remove(t.id), n.status < 200 || n.status >= 300) {
                  try {
                    s = JSON.parse(n.responseText)
                  } catch (t) {
                    return void u(i, null, [new Error("HTTP error: " + n.status)])
                  }
                  s && s.error && s.error.message ? (/categor(y|ies)/i.test(s.error.message) && console.warn("[MapKit] The version of MapKit may be deprecated."), u(i, null, [new Error("HTTP error: " + n.status + ". Message: " + s.error.message + ".")])) : u(i, null, [new Error("HTTP error: " + n.status)])
                } else {
                  try {
                    s = JSON.parse(n.responseText)
                  } catch (t) {
                    return void u(i, null, [new Error("Failed to parse response: " + n.responseText)])
                  }
                  u(i, null, [null, o(e, s)])
                }
              },
              loaderDidFail: function (t, e) {
                p._logNetworkEvent(r, {
                  responseCode: e.status
                }), l.remove(t.id);
                var o = "Network error";
                e.status === n.HTTP.UNAUTHORIZED ? o = n.ErrorStatus.Unauthorized : e.status === n.HTTP.TOO_MANY_REQUESTS ? o = n.ErrorStatus.TooManyRequests : e.status === n.HTTP.BAD_REQUEST && (o = n.ErrorStatus.BadRequest), u(i, null, [new Error(o)])
              }
            }, n.appendServiceAuthOptions({}));
          return m.schedule(), m.id = l.add(m, "xhr"), m.id
        },
        _sendImmediatelyOrWithUserLocation: function (t, e, i, n, o) {
          return this.getsUserLocation || e.getsUserLocation ? this._sendWithUserLocation.apply(this, arguments) : this._send.apply(this, arguments)
        },
        _sendWithUserLocation: function (t, e, i, n, o) {
          var s = this._requestMap.add({
            path: t,
            parameters: e,
            callback: i,
            transform: n,
            name: o
          }, "geo");
          return this._locate(function (t, e) {
            var i = this._requestMap.get(s);
            i && (t ? console.warn("[MapKit] Unable to get current location:", t.message) : i.parameters.userLocation = [e.latitude, e.longitude].join(","), this._send(i.path, i.parameters, i.callback, i.transform, i.name), this._requestMap.remove(s))
          }.bind(this)), s
        },
        _checkOptions: function (t, e) {
          s.checkType(t, "object", "[MapKit] The `options` object is invalid."), Object.keys(t).forEach((function (t) {
            -1 === e.indexOf(t) && console.warn("[MapKit] `" + t + "` is not a valid option.")
          }))
        },
        _bestLanguage: function (t) {
          s.checkType(t, "string", "[MapKit] `language` is not a string.");
          var e = o.bestMatch(t);
          return null === e ? console.warn("[MapKit] " + this._name + ": “" + t + "” is not supported.") : e !== t && console.warn("[MapKit] " + this._name + ": “" + t + "” is not supported. Substituting “" + e + "”"), e
        },
        _locate: function (t) {
          s.required(t, "Missing callback").checkType(t, "function"), r.locate((function (e) {
            var i = e.coords;
            t(null, new a(i.latitude, i.longitude))
          }), (function (e) {
            var i;
            switch (e.code) {
              case e.PERMISSION_DENIED:
                i = "PERMISSION_DENIED";
                break;
              case e.POSITION_UNAVAILABLE:
                i = "POSITION_UNAVAILABLE";
                break;
              case e.TIMEOUT:
                i = "TIMEOUT";
                break;
              default:
                throw new Error("Unknown PositionError code: " + e.code)
            }
            t(new Error(i))
          }), p)
        }
      }, t.exports = m
    },
    3591: (t, e, i) => {
      var n = i(5900);

      function o(t, e) {
        Object.defineProperty(this, "_impl", {
          value: new n(t, e)
        })
      }
      o.prototype = {
        constructor: o,
        get getsUserLocation() {
          return this._impl.getsUserLocation
        },
        set getsUserLocation(t) {
          this._impl.getsUserLocation = t
        },
        get language() {
          return this._impl.language
        },
        set language(t) {
          this._impl.language = t
        },
        cancel: function (t) {
          return this._impl.cancel(t)
        }
      }, t.exports = o
    },
    4712: (t, e, i) => {
      var n, o, s = i(2114);

      function r(t) {
        this.hostNode = t, this._elementNodeMap = {}
      }
      window.document && (n = i(270), (o = function (t) {
        n.Node.call(this, t)
      }).prototype = s.inheritPrototype(n.Node, o, {
        toString: function () {
          return this.stringInfo() + " →"
        }
      })), r.prototype = {
        constructor: r,
        appendAssignedElement: function (t, e) {
          var i = t.slot,
            n = new o(t);
          this._elementNodeMap[i] = n, this.hostNode.addChild(n), e || this.hostNode.element.appendChild(t)
        },
        removeAssignedElement: function (t, e) {
          var i = t.name,
            n = this._elementNodeMap[i];
          delete this._elementNodeMap[i], this.hostNode.removeChild(n), e || this.hostNode.element.removeChild(n.element)
        },
        getAssignedElement: function (t) {
          return this._elementNodeMap[t.name] ? this._elementNodeMap[t.name].element : null
        }
      }, t.exports = r
    },
    5266: (t, e, i) => {
      var n = i(1593),
        o = i(3658);

      function s(t) {
        this._element = o.htmlElement("div", {
          class: "mk-style-helper"
        }), this.delegate = t
      }
      s.prototype = {
        constructor: s,
        delegate: null,
        get element() {
          return this._element
        },
        sizeForElement: function (t) {
          var e = t.cloneNode(!0),
            i = [],
            s = [];
          ! function (t, e, i) {
            if (o.supportsShadowDOM) {
              if ("slot" === t.localName) e.push(t), i.push(t.name);
              else {
                var n = t.getElementsByTagName("slot");
                0 !== n.length && Array.prototype.forEach.call(n, (function (t) {
                  e.push(t), i.push(t.name)
                }))
              }
              e.forEach((function (t) {
                t.name = "mk-slot-disabled"
              }))
            }
          }(t, i, s), this._element.appendChild(e), this.delegate && this.delegate.styleHelperNodeDidMoveToParent && this.delegate.styleHelperNodeDidMoveToParent(e);
          var r = e;
          o.supportsShadowDOM && "slot" === t.localName && (r = e.assignedNodes()[0]);
          var a = function (t) {
            if (!t || t.nodeType !== window.Node.ELEMENT_NODE) return;
            var e = window.getComputedStyle(t),
              i = parseFloat(e.marginLeft),
              o = parseFloat(e.marginTop),
              s = parseFloat(e.marginRight),
              r = parseFloat(e.marginBottom);
            return n.rectFromClientRect(t.getBoundingClientRect()).inset(-i, -o, -s, -r)
          }(r);
          return this._element.removeChild(e),
            function (t, e) {
              o.supportsShadowDOM && t.forEach((function (t, i) {
                t.name = e[i]
              }))
            }(i, s), a && a.size
        },
        backgroundColorForElement: function (t, e) {
          this._element.appendChild(t), this.delegate && this.delegate.styleHelperNodeDidMoveToParent && this.delegate.styleHelperNodeDidMoveToParent(t);
          var i = t;
          if (o.supportsShadowDOM && "slot" === t.localName && !(i = t.assignedNodes()[0])) return this._element.removeChild(t), null;
          var n = window.getComputedStyle(i).backgroundColor;
          return e && (i.style.backgroundColor = "transparent"), this._element.removeChild(t), /^transparent|initial|rgba\(.*, 0\)$/.test(n) ? null : n
        },
        setAnimationForElement: function (t, e, i) {
          var n = t;
          if (!o.supportsShadowDOM || "slot" !== t.localName || (n = t.assignedNodes()[0])) {
            n.style.animation = n.style.webkitAnimation = e;
            var s = function (t) {
              t.animationName === i && (n.style.animation = n.style.webkitAnimation = "", n.removeEventListener("animationend", s), n.removeEventListener("webkitAnimationEnd", s))
            };
            n.addEventListener("animationend", s), n.addEventListener("webkitAnimationEnd", s)
          }
        }
      }, t.exports = s
    },
    9425: (t, e, i) => {
      var n = i(9601),
        o = i(2114),
        s = n.Coordinate,
        r = n.CoordinateRegion,
        a = n.CoordinateSpan,
        l = n.MapRect;
      t.exports = {
        enclosingRegionForCoordinates: function (t) {
          var e = 0,
            i = 180,
            l = -180,
            h = 0,
            c = 90,
            d = -90;
          t.forEach((function (t) {
            var s = o.clamp(t.latitude, -90, 90);
            c = Math.min(c, s), d = Math.max(d, s);
            var r = n.wrapLongitude(t.longitude);
            r < 0 ? (e = Math.min(e, r), l = Math.max(l, r)) : (i = Math.min(i, r), h = Math.max(h, r))
          }));
          var u, p, m = d - c;
          if (e > l) p = i + (u = h - i) / 2;
          else if (i > h) p = e + (u = l - e) / 2;
          else {
            var g = h - e,
              _ = 360 - (i - l);
            p = g < _ ? e + (u = g) / 2 : i + (u = _) / 2
          }
          return new r(new s(c + m / 2, p), new a(m, u))
        },
        padMapRect: function (t, e) {
          o.checkType(e, "object", "[MapKit] MapRect.pad expects a padding object with top, left, bottom, right but got `" + e + "` instead");
          var i = e.left || 0,
            n = e.top || 0;
          return new l(t.origin.x - i, t.origin.y - n, t.size.width + i + (e.right || 0), t.size.height + n + (e.bottom || 0))
        },
        mapRectContains: function (t, e) {
          var i = e.origin.x,
            n = e.origin.y,
            o = t.maxX(),
            s = t.maxY();
          return i >= t.origin.x && i <= o && n >= t.origin.y && n <= s && e.maxX() <= o && e.maxY() <= s
        },
        boundingRectForSortedRects: function (t) {
          if (0 === t.length) return new l;
          if (1 === t.length) {
            var e = t[0].minX();
            return e >= 0 && e < 1 ? t[0] : new l(o.mod(e, 1), t[0].minY(), t[0].size.width, t[0].size.height)
          }
          for (var i = [
            [t[0].minX(), t[0].maxX()]
          ], n = t[0].minY(), s = t[0].maxY(), r = 1, a = t.length, h = 0; r < a; ++r) {
            var c = i[h],
              d = t[r];
            n = Math.min(n, d.minY()), s = Math.max(s, d.maxY()), d.minX() <= c[1] ? i[h] = [c[0], Math.max(c[1], d.maxX())] : (i.push([d.minX(), d.maxX()]), ++h)
          }
          var u = i.length;
          if (1 === u) return new l(i[0][0], n, Math.min(i[0][1] - i[0][0], 1), s - n);
          for (var p = 1 + i[0][0] - i[u - 1][1], m = i[0][0], g = 1; g < u; ++g) {
            var _ = i[g][0] - i[g - 1][1];
            _ > p && (p = _, m = i[g][0])
          }
          return new l(o.mod(m, 1), n, 1 - p, s - n)
        }
      }
    },
    8961: (t, e, i) => {
      var n = i(7640),
        o = {
          EventTarget: n.EventTarget,
          Event: n.Event
        };
      t.exports = o
    },
    2640: (t, e, i) => {
      "use strict";
      var n = i(4891),
        o = i(2114);
      t.exports = {
        _basePath: "",
        _syrupBasePath: "",
        createUrl: function (t) {
          if (!this._basePath) {
            var e = i(3032);
            if (e.state === e.States.UNINITIALIZED) return void 0;
            e._distUrl ? this._basePath = e._distUrl : n.useLocalResources ? this._basePath = this.getMapKitScriptParts().prefix : e.proxyPrefixes ? this._basePath = e.proxyPrefixes[0] + [n.cdnBase, "mk", n.cdnVersion].join("/") : this._basePath = ["https:" + n.cdnBase, "mk", n.cdnVersion].join("/")
          }
          return t = t && t.replace(/^\//, "") || "", [this._basePath, t].join("/")
        },
        createSyrupUrl: function () {
          var t = i(3032);
          if (t.state === t.States.UNINITIALIZED) throw new Error("Cannot create URLs before calling mapkit.init().");
          var e = "/ti/csr/1.x.x";
          return [t._syrupUrl ? t._syrupUrl : t.proxyPrefixes ? t.proxyPrefixes[0] + n.cdnBase + e : "https:" + n.cdnBase + e, "mk-csr.js?mapkitVersion=" + n.version].join("/")
        },
        createImageUrl: function (t) {
          return this.createUrl("images/" + t)
        },
        getMapKitScriptParts: function () {
          for (var t = /(.*)(?=\/mapkit([.a-z-]*)\.js)/, e = document.scripts, i = 0, n = e.length; i < n; ++i) {
            var s = t.exec(e[i].src);
            if (s) {
              var r = o.parseURL(e[i].src);
              return r.prefix = s[0], r
            }
          }
          return {}
        }
      }
    },
    7900: (t, e, i) => {
      var n = i(5211);

      function o(t) {
        this._delegate = t, this._showsUserLocation = !1, this._tracksUserLocation = !1
      }
      o.prototype = {
        constructor: o,
        get showsUserLocation() {
          return this._showsUserLocation
        },
        set showsUserLocation(t) {
          !t || n.isAvailable ? (this._showsUserLocation = t, t ? (n.addEventListener(n.Events.Change, this), n.addEventListener(n.Events.Error, this), n.watch()) : (n.removeEventListener(n.Events.Change, this), n.removeEventListener(n.Events.Error, this))) : console.warn("[MapKit] User location is unavailable.")
        },
        get tracksUserLocation() {
          return this._tracksUserLocation
        },
        set tracksUserLocation(t) {
          !t || n.isAvailable ? (this._tracksUserLocation = t, t ? (n.addEventListener(n.Events.Change, this), n.addEventListener(n.Events.Error, this), n.watch()) : (n.removeEventListener(n.Events.Change, this), n.removeEventListener(n.Events.Error, this))) : console.warn("[MapKit] User location is unavailable.")
        },
        get userLocation() {
          return n
        },
        handleEvent: function (t) {
          switch (t.type) {
            case n.Events.Change:
              this._handleUserLocationChange(t);
              break;
            case n.Events.Error:
              this._handleUserLocationError(t)
          }
        },
        mapWasDestroyed: function () {
          delete this._delegate, n.removeEventListener(n.Events.Change, this), n.removeEventListener(n.Events.Error, this)
        },
        _handleUserLocationChange: function (t) {
          n.errorCode = 0, this._delegate.userLocationDidChange(t)
        },
        _handleUserLocationError: function (t) {
          n.errorCode = t.code, this._delegate.userLocationDidError(t)
        }
      }, t.exports = o
    },
    5211: (t, e, i) => {
      var n = i(9601),
        o = n.MapRect,
        s = n.Coordinate,
        r = i(8961),
        a = i(2114),
        l = i(3032),
        h = i(5870),
        c = {
          Change: "user-location-change",
          Error: "user-location-error"
        },
        d = null;

      function u() {
        this._location = null, this._coordinate = null, this._stale = !1, this._watchers = 0, l.addEventListener(l.Events.Changed, this), l.addEventListener(l.Events.Error, this)
      }
      u.prototype = a.inheritPrototype(r.EventTarget, u, {
        Events: c,
        get location() {
          return this._location
        },
        get coordinate() {
          return this._coordinate
        },
        get stale() {
          return this._stale
        },
        get mapAccuracyRadius() {
          var t = this.location;
          return !this.stale && t.accuracy > 0 ? t.accuracy : 0
        },
        get isAvailable() {
          return window.navigator.geolocation && "function" == typeof window.navigator.geolocation.watchPosition && "function" == typeof window.navigator.geolocation.getCurrentPosition
        },
        getMapRect: function () {
          var t = this.location && this.location.accuracy || 0,
            e = this.coordinate.latitude,
            i = this.coordinate.toMapPoint(),
            s = t * n.mapUnitsPerMeterAtLatitude(e);
          return new o(i.x - s, i.y - s, 2 * s, 2 * s)
        },
        watch: function () {
          this._watchId || (window.navigator.geolocation.watchPosition ? (_(), this._watchId = window.navigator.geolocation.watchPosition(y, w), d = setTimeout((function () {
            _(), w({
              code: 3,
              message: "Timeout expired"
            })
          }), 15e3)) : console.warn("[MapKit] User location is unavailable."))
        },
        locate: function (t, e, i) {
          window.navigator.geolocation.getCurrentPosition ? p && this._watchId ? f(p, t, e) : window.navigator.geolocation.getCurrentPosition((function (i) {
            f(i, t, e)
          }), e, i) : console.warn("[MapKit] User location is unavailable.")
        },
        addEventListener: function () {
          r.EventTarget.prototype.addEventListener.apply(this, arguments) && ++this._watchers
        },
        removeEventListener: function () {
          r.EventTarget.prototype.removeEventListener.apply(this, arguments) && (--this._watchers, 0 === this._watchers && this._watchId && (window.navigator.geolocation.clearWatch(this._watchId), this._watchId = null))
        },
        handleEvent: function (t) {
          switch (t.type) {
            case l.Events.Changed:
            case l.Events.Error:
              if (m && (p = m, m = null), !p) return;
              y(p)
          }
        },
        reset: function () {
          _(), this._watchers = 0, this._watchId = null, p = null
        }
      });
      var p, m = null,
        g = new u;

      function _() {
        clearTimeout(d), d = null
      }

      function f(t, e, i) {
        if ("AutoNavi" === l.tileProvider) {
          var n = new s(t.coords.latitude, t.coords.longitude);
          h.shift(n, (function (n, o) {
            if (n) i && i(n);
            else {
              var s = {
                coords: {
                  latitude: o.latitude,
                  longitude: o.longitude
                }
              };
              "accuracy" in t.coords && (s.coords.accuracy = t.coords.accuracy), e && e(s)
            }
          }))
        } else e && e(t)
      }

      function y(t) {
        _(), p = t, l.error ? w({
          code: 4,
          message: "MapKit not initialized."
        }) : l.ready ? !g._stale && g._coordinate && t.coords.latitude === g._coordinate.latitude && t.coords.longitude === g._coordinate.longitude || f(t, v, w) : m = t
      }

      function v(t) {
        g._stale = !1, g._location = t.coords, g._coordinate = new s(t.coords.latitude, t.coords.longitude), g.dispatchEvent(new b(g._coordinate, t.coords.floorLevel))
      }

      function w(t) {
        m = null, p = null, g._stale = !0, g.dispatchEvent(new C(t))
      }

      function b(t, e) {
        r.Event.call(this, c.Change), this.coordinate = t, this.floorLevel = e, this.timestamp = new Date
      }

      function C(t) {
        r.Event.call(this, c.Error), this.code = t.code, this.message = t.message
      }
      b.prototype = a.inheritPrototype(r.Event, b, {}), C.prototype = a.inheritPrototype(r.Event, C, {}), t.exports = g
    },
    3658: (t, e, i) => {
      var n = i(8006).Tints,
        o = i(975).MaximumRestrictedRotation,
        s = window.document && i(4902).SupportsTouches,
        r = window.document && i(4902).SupportsPointerEvents,
        a = window.document && "ShadowRoot" in window;
      if (a && window.navigator && window.navigator.appVersion) {
        var l = parseInt((navigator.appVersion.match(/AppleWebKit\/(\d+)/) || [])[1], 10);
        l >= 602 && l < 605 && (a = !1)
      }

      function h(t, e) {
        var i = window.document.createElementNS(this, t),
          n = 1;
        if ("object" == typeof e && null != e && !(e instanceof window.Node))
          for (var o in ++n, e) i.setAttribute(o, e[o]);
        for (var s = n, r = arguments.length; s < r; ++s) {
          var a = arguments[s];
          a instanceof window.Node ? i.appendChild(a) : "string" == typeof a && i.appendChild(document.createTextNode(a))
        }
        return i
      }
      t.exports = {
        focusColor: "rgb(0, 122, 255)",
        get devicePixelRatio() {
          return Math.max(Math.round(window.devicePixelRatio), 1) || 1
        },
        roundToDevicePixel: function (t, e) {
          var i = e || this.devicePixelRatio;
          return Math.round(t * i) / i
        },
        supportsTouches: s,
        supportsPointerEvents: r,
        supportsGestureEvents: !!window.GestureEvent,
        startEventType: r ? "pointerdown" : s ? "touchstart" : "mousedown",
        moveEventType: r ? "pointermove" : s ? "touchmove" : "mousemove",
        endEventType: r ? "pointerup" : s ? "touchend" : "mouseup",
        cancelEventType: r ? "pointercancel" : s ? "touchcancel" : void 0,
        supportsForceTouch: !s && window.document && "webkitForce" in MouseEvent.prototype,
        htmlElement: h.bind("http://www.w3.org/1999/xhtml"),
        svgElement: h.bind("http://www.w3.org/2000/svg"),
        supportsShadowDOM: a,
        insideIframe: window.top !== window,
        getShadowDOMTargetFromEvent: function (t, e) {
          var i = this.containingDocumentOrShadowRoot(t);
          if (i === document) return e.target;
          var n = e.changedTouches ? e.changedTouches[0] : e,
            o = i.elementFromPoint(n.clientX, n.clientY);
          return o || document.body
        },
        containingDocumentOrShadowRoot: function (t) {
          return this.supportsShadowDOM ? t.getRootNode() : document
        },
        addShadowRootChild: function (t, e) {
          var n, o = i(270).Node;
          return this.supportsShadowDOM ? n = t.createAndAddShadowRootChild() : (n = t.addChild(new o), e = function (t) {
            for (var e, i = ""; e = t.match(/:host\(/);) {
              i += t.substr(0, e.index), t = t.substr(e.index + e[0].length);
              for (var n = 1; e = t.match(/^([^()]*)([()])?/);) {
                if (t = t.substr(e[0].length), "(" === e[2]) n += 1;
                else if (")" === e[2] && 0 == (n -= 1)) {
                  i += e[1];
                  break
                }
                if (i += e[0], !e[2]) break
              }
            }
            return i + t
          }(e)), n.addChild(new o(this.htmlElement("style", e))), n
        },
        parentNodeForSvgTarget: function (t) {
          return t.tagName && "div" !== t.tagName.toLowerCase() ? this.parentNodeForSvgTarget(t.parentNode) : t
        },
        imagePathForDevice: function (t, e, i) {
          var n, o = Math.floor(this.devicePixelRatio);
          return e + ((n = -1 !== t.indexOf(o) ? o : o > t[t.length - 1] ? t[t.length - 1] : t[0]) > 1 ? "_" + n + "x" : "") + (i = i || ".png")
        },
        parseQueryString: function (t) {
          var e, i = {},
            n = /\+/g,
            o = /([^&=]+)=?([^&]*)/g,
            s = function (t) {
              return decodeURIComponent(t.replace(n, " "))
            };
          if ("string" == typeof t)
            for (; null !== (e = o.exec(t));) i[s(e[1])] = s(e[2]);
          return i
        },
        createSVGIcon: function (t, e) {
          var i = "mk-icon";
          e.class && (i += " " + e.class, delete e.class);
          var n = this.svgElement("svg", e);
          return n.setAttribute("class", i), n.setAttribute("focusable", !1), n.appendChild(this.svgElement("g")).appendChild(t), n
        },
        convertColorToRGB: function (t) {
          var e = document.createElement("div");
          return e.style.setProperty("color", t), e.style.color
        },
        isValidCSSColor: function (t) {
          return "" !== this.convertColorToRGB(t)
        },
        updateLabel: function (t, e) {
          t.setAttribute("title", e), t.setAttribute("aria-label", e)
        },
        easeInOut: function (t) {
          var e = Math.pow(t, 2);
          return e / (e + Math.pow(1 - t, 2))
        },
        lerp: function (t, e, i) {
          return (1 - t) * e + t * i
        },
        darkColorScheme: function (t) {
          return t === n.Dark
        },
        restrictRotation: function (t) {
          return t < 180 ? Math.min(t, o) : Math.max(t, 360 - o)
        },
        getIntegralZoom: function (t) {
          return Math.floor(t + 1e-6)
        },
        getCorsAttribute: function (t) {
          return t ? "use-credentials" : "anonymous"
        }
      }
    },
    2607: t => {
      t.exports = ""
    },
    6488: () => { },
    7585: t => {
      "use strict";
      t.exports = JSON.parse('{"ar-SA":6,"ca-ES":1,"cs-CZ":1,"da-DK":1,"de-DE":1,"el-GR":1,"en-AU":1,"en-GB":1,"en-US":0,"en-ZA":0,"es-ES":1,"es-MX":1,"fi-FI":1,"fr-CA":0,"fr-FR":1,"he-IL":0,"hi-IN":0,"hr-HR":1,"hu-HU":1,"id-ID":1,"it-IT":1,"ja-JP":0,"ko-KR":0,"ms-MY":1,"nb-NO":1,"nl-NL":1,"pl-PL":1,"pt-BR":0,"pt-PT":1,"ro-RO":1,"ru-RU":1,"sk-SK":1,"sv-SE":1,"th-TH":0,"tr-TR":1,"uk-UA":1,"vi-VN":1,"zh-CN":1,"zh-HK":0,"zh-TW":0}')
    },
    4891: t => {
      "use strict";
      t.exports = JSON.parse('{"version":"5.72.108","build":"22.27-146","cdnBase":"//cdn.apple-mapkit.com","cdnVersion":"5.72.108"}')
    },
    8872: t => {
      "use strict";
      t.exports = JSON.parse('{"Annotation.Clustering.AccessibilityLabel":"{{n}} locations, {{title}}, {{subtitle}}","Annotation.Clustering.More":"+{{n}} more","Annotation.Clustering.More.Plural":"+{{n}} more","Annotation.Clustering.NoTitle.AccessibilityLabel":"{{n}} locations, {{subtitle}}","Annotation.Generic.AccessibilityLabel":"{{title}}, {{subtitle}}","Annotation.Marker.AccessibilityLabel":"Marker","Annotation.Pin.AccessibilityLabel":"Pin","Annotation.Pin.Green.AccessibilityLabel":"Green Pin","Annotation.Pin.Purple.AccessibilityLabel":"Purple Pin","Annotation.Pin.Red.AccessibilityLabel":"Red Pin","Compass.Degrees.Plural":"{{n}} degrees","Compass.Degrees.Single":"{{n}} degree","Compass.EastIndicator":"E","Compass.NorthIndicator":"N","Compass.SouthIndicator":"S","Compass.Tooltip":"Rotate the map","Compass.WestIndicator":"W","Legal.Apple.URL":"https://www.apple.com/legal/internet-services/maps/legal-en.html","Legal.Label":"Legal","Location.Error.Instructions":"To allow this page to show your current location, connect to Wi-Fi and enable location services in your browser.","Location.Error.Message":"Your location can only be shown when location services are enabled and you are connected to the Internet.","Location.Error.Support.Label":"Learn more","Location.Error.Title":"Your current location cannot be shown.","Location.Subtitle":"Unknown Address","Location.Title":"Current Location","Logo.Apple.Tooltip":"Apple Maps","Logo.AutoNavi.Tooltip":"AutoNavi Maps","MapType.Tooltip":"Change the map type","Mode.Hybrid":"Hybrid","Mode.Satellite":"Satellite","Mode.Standard":"Standard","Scale.Feet.Short":"ft","Scale.Kilometer.Short":"km","Scale.Meter.Short":"m","Scale.Mile.Short":"mi","Track.User.Location.Tooltip":"Show your current location","Zoom.In.Tooltip":"Zoom In","Zoom.Out.Tooltip":"Zoom Out"}')
    },
    3120: t => {
      "use strict";
      t.exports = JSON.parse('{"en-AU":"en-GB","en-IE":"en-GB","en-IN":"en-GB","en-NZ":"en-GB","en-SG":"en-GB","en-ZA":"en-GB","es-LA":"es-MX","es-XL":"es-MX","nn-NO":"nb-NO","no-NO":"nb-NO","vi-VI":"vi-VN","iw":"he-IL"}')
    },
    2245: t => {
      "use strict";
      t.exports = JSON.parse('["en-US","fr-FR","pt-BR","zh-CN"]')
    },
    6260: t => {
      "use strict";
      t.exports = JSON.parse('{"zh":{"CN":"Hans","HK":"Hant","TW":"Hant"}}')
    },
    1969: t => {
      "use strict";
      t.exports = ["ar-SA", "he-IL"]
    },
    8946: t => {
      "use strict";
      t.exports = JSON.parse('["ar-SA","ca-ES","cs-CZ","da-DK","de-DE","el-GR","en-GB","en-US","es-ES","es-MX","fi-FI","fr-CA","fr-FR","he-IL","hi-IN","hr-HR","hu-HU","id-ID","it-IT","ja-JP","ko-KR","ms-MY","nl-NL","nb-NO","pl-PL","pt-BR","pt-PT","ro-RO","ru-RU","sk-SK","sv-SE","th-TH","tr-TR","uk-UA","vi-VN","zh-CN","zh-HK","zh-TW"]')
    },
    2602: t => {
      "use strict";
      t.exports = JSON.parse('["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]')
    }
  },
    e = {};

  function i(n) {
    var o = e[n];
    if (void 0 !== o) return o.exports;
    var s = e[n] = {
      exports: {}
    };
    return t[n](s, s.exports, i), s.exports
  }
  window.mapkit = i(2971)
})();
//# sourceMappingURL=https://mw-ci1-mapkitjs.geo.apple.com/admin/source-maps/5.72.108/source-maps/mapkit.min.js.map
