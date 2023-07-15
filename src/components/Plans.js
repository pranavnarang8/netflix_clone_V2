import React, { useEffect, useState } from "react";
import "./Plans.css";
import db from "../firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { loadStripe } from "@stripe/stripe-js";

const Plans = () => {
  const [products, setProducts] = useState([]);
  const user = useSelector(selectUser);
  const [subscription, setSubsciption] = useState(null);

  useEffect(() => {
    db.collection("customers")
      .doc(user.uid)
      .collection("subscriptions")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(async (subscription) => {
          setSubsciption({
            role: subscription.data().role,
            current_period_end: subscription.data().current_period_end.seconds,
            current_period_start:
              subscription.data().current_period_start.seconds,
          });
        });
      });
  }, [user.uid]);

  useEffect(() => {
    db.collection("products")
      .where("active", "==", true)
      .get()
      .then((querySnapshot) => {
        const products = {};
        querySnapshot.forEach(async (productDoc) => {
          products[productDoc.id] = productDoc.data();
          const priceSnap = await productDoc.ref.collection("prices").get();
          priceSnap.docs.forEach((price) => {
            products[productDoc.id].prices = {
              priceId: price.id,
              priceData: price.data(),
            };
          });
        });
        setProducts(products);
      });
  }, []);

  const loadCheckout = async (priceId) => {
    const docRef = await db
      .collection("customers")
      .doc(user.uid)
      .collection("checkout_sessions")
      .add({
        price: priceId,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      });

    docRef.onSnapshot(async (snap) => {
      const { error, sessionId } = snap.data();
      if (error) {
        //show am error to the customer
        //inspect your cloud function logs in the firebase console
        alert(`An error occured: ${error.message}`);
      }

      if (sessionId) {
        //redirect to checkout. Init Stripe
        const stripe = await loadStripe(
          "pk_test_51NFEoASIFj5DlpuxS46NA6iN8h8eQO1MPKqRdi0Z5iCsjqhRdyTsWPnC0cke5yF3OVDEAMfS6YtZuhAPQO5azEfC00QpQTvdOx"
        );
        stripe.redirectToCheckout({ sessionId });
      }
    });
  };

  return (
    <div className="plan">
      <br />
      {subscription && (
        <p>
          Renewal date :
          {" " +
            new Date(
              subscription?.current_period_end * 1000
            ).toLocaleDateString()}{" "}
        </p>
      )}
      {/* to convert products object into an array */}
      {Object.entries(products).map(([productId, productData]) => {
        //add some logic if the user subscription is active

        const isCurrentPackage = productData.name
          ?.toLowerCase()
          .includes(subscription?.role);

        return (
          <div
            className={`${
              isCurrentPackage && "plan_plan--disabled"
            } plan__plan`}
            key={productId}
          >
            <div className="plan__info">
              <h5>{productData.name}</h5>
              <h6>{productData.description}</h6>
            </div>
            <button
              onClick={() =>
                !isCurrentPackage && loadCheckout(productData?.prices?.priceId)
              }
            >
              {isCurrentPackage ? "Current Plan" : "Subscribe"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Plans;
