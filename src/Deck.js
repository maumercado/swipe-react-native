import React, { Component } from "react";
import { View, Animated, PanResponder, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
    constructor(props) {
        super(props);

        this.position = new Animated.ValueXY();

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                this.position.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    this.forceSwipe("right");
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    this.forceSwipe("left");
                } else {
                    this.resetPosition();
                }
            }
        });

        this.panResponder = panResponder;
    }

    onSwipeComplete(direction) {
        const { onSwipeLeft, onSwipeRight } = this.props;
        direction === "right" ? onSwipeRight() : onSwipeLeft();
    }

    forceSwipe(direction) {
        const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(this.position, {
            toValue: { x: x * 2, y: 0 },
            duration: SWIPE_OUT_DURATION
        }).start(() => {
            // executes when swipe completes
            this.onSwipeComplete(direction);
        });
    }

    resetPosition() {
        Animated.spring(this.position, {
            toValue: { x: 0, y: 0 }
        }).start();
    }

    getCardStyle() {
        const { position } = this;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 2.0, 0, SCREEN_WIDTH * 2.0],
            outputRange: ["-120deg", "0deg", "120deg"]
        });

        return { ...position.getLayout(), transform: [{ rotate }] };
    }

    renderCards() {
        return this.props.data.map((item, index) => {
            if (index === 0) {
                return (
                    <Animated.View
                        key={item.id}
                        style={this.getCardStyle()}
                        {...this.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            }
            return this.props.renderCard(item);
        });
    }
    render() {
        return <View>{this.renderCards()}</View>;
    }
}

export default Deck;
