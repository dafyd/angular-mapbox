angular.module('angularMapbox').directive('mapbox', function($compile, $q) {
  var _mapboxMap;

  return {
    restrict: 'E',
    transclude: true,
    scope: true,
    replace: true,
    link: function(scope, element, attrs) {
      L.mapbox.accessToken = attrs.apiKey;
      scope.map = L.mapbox.map(element[0], attrs.mapId, {
        accessToken: attrs.apiKey
      });
      _mapboxMap.resolve(scope.map);

      var mapWidth = attrs.width || '500px';
      var mapHeight = attrs.height || '500px';
      element.css('width', mapWidth);
      element.css('height', mapHeight);

      var zoom = attrs.zoom || 12;
      if(attrs.lat && attrs.lng) {
        scope.map
        	.setView([attrs.lat, attrs.lng], zoom)
        	.invalidateSize();
      }

      scope.isClusteringMarkers = attrs.clusterMarkers !== undefined;

      var shouldRefitMap = attrs.scaleToFit !== undefined;
      scope.fitMapToMarkers = function() {
        if(!shouldRefitMap) return;
        // TODO: only call this after all markers have been added, instead of per marker add

        var group = new L.featureGroup(scope.markers);
        scope.map.fitBounds(group.getBounds());
      };

      if(attrs.onReposition) {
        scope.map.on('dragend', function() {
          scope[attrs.onReposition](scope.map.getBounds());
        });
      }

      if(attrs.onZoom) {
        scope.map.on('zoomend', function() {
          scope[attrs.onZoom](scope.map.getBounds());
        });
      }
      
    },
    template: '<div class="angular-mapbox-map" ng-transclude></div>',
    controller: function($scope) {
      $scope.markers = [];
      $scope.featureLayers = [];

      _mapboxMap = $q.defer();
      $scope.getMap = this.getMap = function() {
        return _mapboxMap.promise;
      };

      if(L.MarkerClusterGroup) {
        $scope.clusterGroup = new L.MarkerClusterGroup();
        this.getMap().then(function(map) {
          map.addLayer($scope.clusterGroup);
        });
      }

      this.$scope = $scope;
    }
  };
});

