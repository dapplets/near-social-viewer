import React, { useCallback, useEffect, useState } from "react";
import { MutableWebContext } from "./MutableWebContext";
import { useAccount, useNear } from "near-social-vm";

const CONTRACT_NAME = "social.dapplets.near";

const links = {
  "mob.near/widget/N.LikeButton": [
    "dapplets.near/widget/N.DislikeButton",
    "dapplets.near/widget/N.DislikeButton",
    "dapplets.near/widget/Cat",
  ],
};

function convertLinksToOverrides(links) {
  const overrides = {};

  for (const [src, dsts] of Object.entries(links)) {
    const components = [{ src, props: {} }];
    overrides[src] = {
      src: "dapplets.near/widget/LayoutManager",
      props: { components },
    };
    for (const dst of dsts) {
      components.push({ src: dst, props: {} });
    }
  }

  return overrides;
}

function transformLinksObject(input) {
  const output = [];

  for (const authorId in input) {
    const link = input[authorId].link;

    for (const contextAuthorId in link) {
      const widgets = link[contextAuthorId].widget;

      for (const contextWidgetId in widgets) {
        const widgetArray = JSON.parse(widgets[contextWidgetId]);

        widgetArray.forEach((widgetObj) => {
          const entry = {
            authorId,
            context: `${contextAuthorId}/widget/${contextWidgetId}`,
            widget: widgetObj.widget,
          };

          if (widgetObj.props) {
            entry.props = widgetObj.props;
          }

          output.push(entry);
        });
      }
    }
  }

  return output;
}

const overrides = convertLinksToOverrides(links);

export const MutableWebProvider = ({ children }) => {
  const account = useAccount();
  const near = useNear();

  const getLinks = useCallback(
    async (queries) => {
      const keys = queries.map(
        ({ context, accountId }) => `${accountId}/link/${context}`
      );
      const links = await near.viewCall(CONTRACT_NAME, "get", { keys });

      return transformLinksObject(links);
    },
    [near]
  );

  const clearLink = useCallback(
    async (context) => {
      const signedAccountId = near.accountId;

      if (!signedAccountId) {
        throw new Error("You're not logged in. Sign in to commit data.");
      }

      const [sourceWidgetOwnerId, sourceWidgetType, sourceWidgetId] =
        context.split("/");

      await near.functionCall(
        CONTRACT_NAME,
        "set",
        {
          data: {
            [near.accountId]: {
              link: {
                [sourceWidgetOwnerId]: {
                  [sourceWidgetType]: {
                    [sourceWidgetId]: JSON.stringify([]),
                  },
                },
              },
            },
          },
        },
        undefined, // default gas
        "50000000000000000000000" // 0.05 near storage deposit
      );
    },
    [near]
  );

  const addLink = useCallback(
    async (link) => {
      const { context, widget, props } = link;

      const signedAccountId = near.accountId;

      if (!signedAccountId) {
        throw new Error("You're not logged in. Sign in to commit data.");
      }

      const [sourceWidgetOwnerId, sourceWidgetType, sourceWidgetId] =
        context.split("/");

      if (sourceWidgetType !== "widget") {
        throw new Error("Only widgets can be linked");
      }

      const existingLinks = await getLinks([
        {
          context,
          accountId: signedAccountId,
        },
      ]);

      const newLinks = [
        ...existingLinks.map(({ widget, props }) => ({ widget, props })),
        { widget, props },
      ];

      await near.functionCall(
        CONTRACT_NAME,
        "set",
        {
          data: {
            [near.accountId]: {
              link: {
                [sourceWidgetOwnerId]: {
                  [sourceWidgetType]: {
                    [sourceWidgetId]: JSON.stringify(newLinks),
                  },
                },
              },
            },
          },
        },
        undefined, // default gas
        "50000000000000000000000" // 0.05 near storage deposit
      );
    },
    [near, getLinks]
  );

  useEffect(() => {
    window.mweb = { addLink, getLinks, clearLink };
  }, [addLink, getLinks, clearLink]);

    // const [overrides, setOverrides] = useState({});

//   useEffect(() => {
//     (async () => {
//       if (!account.signedAccountId) return [];

//       const links2 = await getLinks([
//         {
//           context: "mob.near/widget/N.LikeButton",
//           accountId: account.signedAccountId,
//         },
//       ]);

//       console.log('links2', links2)

//       const _overrides = {};

//       for (const { context, widget, props } of links2) {
//         if (!_overrides[context]) _overrides[context] = [];

//         _overrides[context].push(widget);
//       }

//       for (const context in _overrides) {
//         _overrides[context] = convertLinksToOverrides([..._overrides[context]])
//       }

//       setOverrides(_overrides);
//     })();
//   }, [getLinks, account]);

  const state = {
    overrides,
  };

  useEffect(() => {
    console.log("links", links);
    console.log("overrides", overrides);
  }, [links, overrides]);

  return (
    <MutableWebContext.Provider value={state}>
      {children}
    </MutableWebContext.Provider>
  );
};
