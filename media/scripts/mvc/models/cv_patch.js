(function() {
  'use strict';

  bs.models.CVPatch = Backbone.Model.extend({
    initialize: function(attrs, options) {
      this.context = this.collection.context;
      this.sources = this.collection.patchSources;
      this.destinations = this.collection.patchDestinations;
      this.gainNode = this.context.createGainNode();

      this.on('change:source', this.sourceChange);
      this.on('change:destination', this.destinationChange);
      this.listenTo(this.collection, 'reset', this.exit);

      this.setSource(this.get('source'));
      this.setDestination(this.get('destination'));
    },

    defaults: {
      'destination': 'none',
      'source': 'none',
      'outputIndex': 0
    },

    exit: function() {
      // this is hax and leaks memory
      // put a break poing here and switch presets.  You will see cv patch nodes pile up.
      // If I could figure a better way to disconnect nodes...
      this.gainNode.disconnect();
    },
    
    sourceChange: function(model, source) {
      this.setSource(source);
    },

    setSource: function(source) {
      var prevSource = this.sources[this.previousAttributes().source];
      var source = this.sources[source];
      var destination = this.destinations[this.get('destination')];
      this.gainNode.disconnect();
      this.gainNode = this.context.createGainNode();
      
      if (source) {
        source.connect(this.gainNode);
      }

      if (destination) {
        this.gainNode.gain.value = (destination.maxValue > 20000 ? 20000 : destination.maxValue) / 2;
        this.gainNode.connect(destination);
      }
    },

    destinationChange: function(model, destination) {
      this.setDestination(destination);
    },

    setDestination: function(destination) {
      var prevDestination = this.destinations[this.previousAttributes().destination];
      var destination = this.destinations[destination];

      if (prevDestination) {
        this.gainNode.disconnect();
      }

      if (destination) {
        // set to max of 20000 or maxValue 
        // for some reason maxValue on oscillator.frequency is 100000.  this is to combat that.
        this.gainNode.gain.value = (destination.maxValue > 20000 ? 20000 : destination.maxValue) / 2;
        this.gainNode.connect(destination);
      }
    }
    
  });
})();
