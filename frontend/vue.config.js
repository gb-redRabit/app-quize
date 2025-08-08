const path = require('path');

module.exports = {
  runtimeCompiler: true,
  // --- POCZĄTEK POPRAWKI ---
  transpileDependencies: ['@vueuse/motion'],
  // --- KONIEC POPRAWKI ---
  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      });
      return definitions;
    });

    // Optymalizacja obrazów
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        bypassOnDebug: true,
        mozjpeg: {
          progressive: true,
          quality: 65,
        },
        optipng: {
          enabled: true,
        },
        pngquant: {
          quality: [0.65, 0.9],
          speed: 4,
        },
        gifsicle: {
          interlaced: false,
        },
        webp: {
          quality: 75,
        },
      });

    // Lepsze nazewnictwo chunków dla łatwiejszej analizy wydajności
    config.optimization.splitChunks({
      cacheGroups: {
        // Wydziel vendor chunks
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial',
        },
        // Wydziel często używane komponenty
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
    });
  },

  // Dodajemy konfigurację dla lepszej wydajności produkcyjnej
  configureWebpack: {
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm-bundler.js',
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimization: {
      // Minimalizuj bundle
      minimize: process.env.NODE_ENV === 'production',

      // Wydziel kod używany tylko w określonych widokach
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Uzyskaj nazwę pakietu npm
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // Zwróć nazwę chunku npm.[nazwa-pakietu]
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      },
    },
  },

  // Dodajemy konfigurację dla Service Workera do cachowania zasobów
  pwa: {
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: new RegExp('^https://app-quize.onrender.com/api'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 24 godziny
            },
          },
        },
        {
          urlPattern: /\.(?:js|css)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources',
          },
        },
      ],
    },
  },
};
