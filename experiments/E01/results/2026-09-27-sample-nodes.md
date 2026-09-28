# E01 -- two sample nodes read verbatim (teacher run, newtons-laws-motion)

Copied verbatim from the private sandbox course repository of run 1, at commit
fd27fa7. These are the two nodes the reviewer read as a returning adult:
the opening conceptual node (L01.M01.O01) and the calculation node (L02.M01.O02).

## nodes/L01.M01.O01/node.json

```json
{
  "schema": "metadax.node/0.2",
  "id": "L01.M01.O01",
  "parent_id": null,
  "kind": "objective",
  "depth": 1,
  "anchor": null,
  "title": "Explain net force and inertia",
  "question": "",
  "canonical_question": "What are net force and inertia, and why do they together decide how an object's motion changes?",
  "intent": null,
  "summary": [
    "The net force on a body is the single vector left after adding up every push and pull on it.",
    "Inertia is a body's resistance to any change in motion; only a net force overcomes it."
  ],
  "concepts": [
    "net-force",
    "inertia"
  ],
  "new_concepts": [],
  "bloom_level": "Understand",
  "scope": "in_scope",
  "reuse": null,
  "links": [],
  "core": {
    "sections": [
      {
        "id": "s1",
        "heading": "Why start with force and inertia",
        "body_md": "Coming back to physics, the fastest way to make Newton's laws feel obvious is to get two ideas straight first: what a force actually does, and why objects resist having their motion changed. Almost every confusion about motion, from why a car keeps sliding on ice to why you lurch forward when a bus stops, comes from mixing up 'what keeps something moving' with 'what changes its motion'. Newton's answer, which we build toward, is that motion does not need a cause but a change in motion does. Force and inertia are the two halves of that sentence. Get them clear and the three laws become descriptions of things you already feel every day."
      },
      {
        "id": "s2",
        "heading": "What 'net force' means",
        "body_md": "A force is a push or a pull, and it has both a size and a direction, so it is a vector. Real objects usually have several forces on them at once: gravity pulling down, the ground pushing up, a hand pushing sideways, friction resisting. The net force is what you get when you add all of those together as vectors, keeping track of direction. If they cancel, the net force is zero even though individual forces are large. A book resting on a table has gravity (down) and the table's support (up) of equal size, so the net force is zero. Only the net force, not any single force on its own, tells you how the motion will change.",
        "check": {
          "question": "Two people push a box with equal force in opposite directions. What is the net force on the box?",
          "answer": "Zero, because the two equal and opposite pushes cancel as vectors."
        }
      },
      {
        "id": "s3",
        "heading": "Inertia: resistance to change",
        "body_md": "Inertia is the tendency of a body to keep doing what it is already doing: staying at rest if it is at rest, or moving in a straight line at a steady speed if it is already moving. It is not a force and it does not push anything. It is simply the fact that changing an object's motion requires a net force, and more massive objects require more force for the same change. A loaded shopping trolley is harder to get moving, and harder to stop, than an empty one; that extra reluctance is its greater inertia. Mass is the number we use to measure inertia."
      },
      {
        "id": "s4",
        "heading": "A concrete case: the cup on the dashboard",
        "body_md": "Rest a cup on a smooth dashboard and drive at a steady speed in a straight line. The cup rides along quite happily: with no net force along the direction of travel, its motion does not change. Now brake hard. The car slows, but nothing has pushed the cup backwards, so its inertia carries it forward at the old speed and it slides toward the windscreen. It looks as if a force threw the cup forward, but the truth is the opposite: a force (from friction or the seat) slowed the car, and the cup, feeling little of that force, simply kept going. This is inertia and net force acting out in a single second."
      },
      {
        "id": "s5",
        "heading": "A common mistake",
        "body_md": "A common mistake is to think a moving object needs a continuous force to keep moving, because everyday motion always seems to fade away when you stop pushing. But what fades the motion is not the absence of your push; it is the presence of another force, usually friction or air resistance, acting against the motion. Remove those, as on ice or in space, and an object coasts on with no push at all. So 'no net force' does not mean 'no motion'; it means 'no change in motion'. Keeping that distinction is the whole point of this module.",
        "check": {
          "question": "A puck slides across frictionless ice at constant velocity. What net force is needed to keep it going?",
          "answer": "None. With no friction, zero net force is needed; the puck coasts because of its inertia."
        }
      },
      {
        "id": "s6",
        "heading": "Putting it together",
        "body_md": "Net force and inertia are two sides of one idea. Inertia says an object will not change its motion on its own; net force is the only thing that can make it change. Add up all the pushes and pulls: if they cancel, the object carries on unchanged whatever its speed; if they do not, the motion changes in the direction of the leftover force. Everything in Newton's three laws is a precise statement of that relationship, so it is worth being able to say it in your own words before moving on."
      }
    ],
    "key_points": [
      "A force is a vector; the net force is the vector sum of all forces on a body.",
      "Zero net force means no change in motion, not necessarily no motion.",
      "Inertia is a body's resistance to any change in its motion, measured by its mass.",
      "Only a non-zero net force can change how an object is moving.",
      "Everyday motion fades because of friction and air resistance, not the loss of a push."
    ],
    "bridge_to_parent": "These precise meanings of net force and inertia are the vocabulary the rest of this module uses before any law is stated.",
    "bridge_to_objective": "",
    "source_refs": []
  },
  "seeds": [
    "How exactly do we add two forces that point in different directions?",
    "Can you show a worked example where the net force is not zero?",
    "How is inertia related to mass, and is it the same as weight?"
  ],
  "path": [],
  "created_by": "author-sbx01",
  "visibility": "shared",
  "created_at": "2026-09-27T20:07:55Z",
  "updated_at": "2026-09-27T20:07:55Z",
  "content_sha256": "b8d55382617e8a4e64d5ebb419f016bb919a064a4af7d28b51c3ace8e3090062",
  "superseded_by": null
}
```

## nodes/L02.M01.O02/node.json

```json
{
  "schema": "metadax.node/0.2",
  "id": "L02.M01.O02",
  "parent_id": null,
  "kind": "objective",
  "depth": 1,
  "anchor": null,
  "title": "Calculate acceleration from net force",
  "question": "",
  "canonical_question": "How do you calculate the acceleration of a simple one-body system from its net force and mass?",
  "intent": null,
  "summary": [
    "Rearrange F = ma to a = F / m to find acceleration from net force and mass.",
    "First combine forces into a net force, then divide by mass, keeping units consistent."
  ],
  "concepts": [
    "newtons-second-law",
    "kinematic-quantities"
  ],
  "new_concepts": [],
  "bloom_level": "Apply",
  "scope": "in_scope",
  "reuse": null,
  "links": [],
  "core": {
    "sections": [
      {
        "id": "s1",
        "heading": "Turning the law into a calculation",
        "body_md": "Knowing F = ma is one thing; using it to get a number is the skill this objective builds. Almost every simple mechanics problem comes down to the same recipe: find the net force on the body, then divide by the mass to get the acceleration. This section walks through that recipe on one-body examples so it becomes automatic."
      },
      {
        "id": "s2",
        "heading": "The recipe",
        "body_md": "Step one: identify every force on the body and add them as vectors to get the net force F. Step two: identify the mass m in kilograms. Step three: compute a = F / m. Step four: read off the direction, the acceleration points the same way as the net force. Keeping units in newtons, kilograms and metres per second squared means the answer comes out in m/s^2 automatically.",
        "check": {
          "question": "What is the first step before you can divide by mass?",
          "answer": "Combine all the forces on the body into a single net force, keeping track of direction."
        }
      },
      {
        "id": "s3",
        "heading": "Worked example one: a single push",
        "body_md": "A 4 kg toolbox sits on a low-friction floor. You push it with a net force of 20 N. Then a = F / m = 20 / 4 = 5 m/s^2, directed the way you push. Starting from rest, after 3 seconds its speed is a times t = 5 times 3 = 15 m/s. Notice the two-step flow: the second law gives the acceleration, then simple kinematics turns that acceleration into a speed."
      },
      {
        "id": "s4",
        "heading": "Worked example two: forces that partly cancel",
        "body_md": "Now the same 4 kg toolbox is pushed forward with 20 N while friction resists with 8 N. First find the net force: 20 minus 8 = 12 N forward. Then a = F / m = 12 / 4 = 3 m/s^2. The lesson is that you must resolve to the net force first; using the 20 N push alone would overstate the acceleration. Only the leftover force accelerates the body."
      },
      {
        "id": "s5",
        "heading": "A common mistake",
        "body_md": "A common mistake is to plug the largest single force into F = ma instead of the net force. If two forces oppose, the body accelerates according to their difference, not either one alone. Always combine forces first. A second slip is mixing units, such as grams with newtons; convert everything to kilograms, newtons and metres before dividing."
      }
    ],
    "key_points": [
      "Rearrange F = ma to a = F / m to solve for acceleration.",
      "Always compute the net force before dividing by mass.",
      "Acceleration points in the direction of the net force.",
      "Use consistent SI units so the answer is in m/s^2.",
      "The second law gives acceleration; kinematics then gives speed and distance."
    ],
    "bridge_to_parent": "This puts the module's equation to work, turning a net force and a mass into a numerical acceleration.",
    "bridge_to_objective": "",
    "source_refs": []
  },
  "seeds": [
    "How do I combine forces that act at an angle to each other?",
    "How do I get distance travelled from the acceleration?",
    "What changes when the mass itself changes during the motion?"
  ],
  "path": [],
  "created_by": "author-sbx01",
  "visibility": "shared",
  "created_at": "2026-09-27T20:15:10Z",
  "updated_at": "2026-09-27T20:15:10Z",
  "content_sha256": "932653ca03abb4a02d44b2ab966a4b774b83e68bbc7e6924c632d16fca856988",
  "superseded_by": null
}
```
